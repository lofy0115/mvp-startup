'use client'

import { useState, useMemo } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Layers, Sparkles, Trash2, Edit2, X, Check } from 'lucide-react'

interface ClusteringAnalysisProps {
  projectId: string
}

type DimensionType = 'pain_point' | 'user_type' | 'scenario'

const DIMENSION_CONFIG: Record<DimensionType, { label: string; keywords: string[] }> = {
  pain_point: {
    label: '痛点类型',
    keywords: ['贵', '慢', '难用', '不稳定', '麻烦', '复杂', '卡', '闪退', '崩溃', 'bug', '失望', '糟糕', '差', '烂', '投诉', '退款', '骗子', '坑', '垃圾', '废物'],
  },
  user_type: {
    label: '用户类型',
    keywords: ['新手', '小白', '老用户', '专业', '个人', '企业', '团队', '付费', '免费', '会员', 'vip', '学生', '上班族', '老板', '开发者'],
  },
  scenario: {
    label: '使用场景',
    keywords: ['上班', '通勤', '出差', '回家', '周末', '晚上', '凌晨', '约会', '会议', '上课', '学习', '工作', '娱乐', '休息', '旅游', '度假'],
  },
}

function extractKeywords(text: string): string[] {
  const normalized = text.toLowerCase()
  const found: string[] = []
  
  for (const kw of [...DIMENSION_CONFIG.pain_point.keywords, ...DIMENSION_CONFIG.user_type.keywords, ...DIMENSION_CONFIG.scenario.keywords]) {
    if (normalized.includes(kw)) {
      found.push(kw)
    }
  }
  
  return [...new Set(found)]
}

function autoCluster(complaints: Array<{ id: string; rawText: string }>, dimension: DimensionType): Array<{ name: string; complaintIds: string[] }> {
  const clusters: Record<string, string[]> = {}
  const dimensionKeywords = DIMENSION_CONFIG[dimension].keywords

  for (const complaint of complaints) {
    const text = complaint.rawText.toLowerCase()
    let matched = false

    for (const keyword of dimensionKeywords) {
      if (text.includes(keyword)) {
        if (!clusters[keyword]) {
          clusters[keyword] = []
        }
        clusters[keyword].push(complaint.id)
        matched = true
      }
    }

    if (!matched) {
      if (!clusters['其他']) {
        clusters['其他'] = []
      }
      clusters['其他'].push(complaint.id)
    }
  }

  return Object.entries(clusters)
    .filter(([, ids]) => ids.length > 0)
    .map(([name, complaintIds]) => ({ name, complaintIds }))
    .sort((a, b) => b.complaintIds.length - a.complaintIds.length)
}

export function ClusteringAnalysis({ projectId }: ClusteringAnalysisProps) {
  const { phase1Data, addClusters, removeCluster } = useAppStore()
  const [dimension, setDimension] = useState<DimensionType>('pain_point')
  const [isClustering, setIsClustering] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const complaints = phase1Data.complaints
  const clusters = phase1Data.clusters.filter((c) => c.dimension === dimension)

  const handleAutoCluster = async () => {
    if (complaints.length === 0) return

    setIsClustering(true)
    try {
      const existingSystemClusters = clusters.filter((c) => c.type === 'system')
      for (const c of existingSystemClusters) {
        await fetch(`/api/clusters?id=${c.id}`, { method: 'DELETE' })
        removeCluster(c.id)
      }

      const newClusters = autoCluster(
        complaints.map((c) => ({ id: c.id, rawText: c.rawText })),
        dimension
      )

      const createdClusters = []
      for (const cluster of newClusters) {
        const res = await fetch('/api/clusters', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId,
            name: cluster.name,
            dimension,
            complaintIds: cluster.complaintIds,
            type: 'system',
          }),
        })
        const data = await res.json()
        createdClusters.push(data.cluster)
      }

      addClusters(createdClusters)
    } catch (error) {
      console.error('Failed to cluster:', error)
    } finally {
      setIsClustering(false)
    }
  }

  const handleRename = async (id: string) => {
    if (!editName.trim()) return

    try {
      const res = await fetch('/api/clusters', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name: editName }),
      })
      if (res.ok) {
        setEditingId(null)
      }
    } catch (error) {
      console.error('Failed to rename cluster:', error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/clusters?id=${id}`, { method: 'DELETE' })
      removeCluster(id)
    } catch (error) {
      console.error('Failed to delete cluster:', error)
    }
  }

  const clusterStats = useMemo(() => {
    return clusters.map((c) => {
      const complaintTexts = c.complaintIds
        .map((id) => complaints.find((comp) => comp.id === id)?.rawText || '')
        .join(' ')
      const keywords = extractKeywords(complaintTexts)
      return { ...c, keywords }
    })
  }, [clusters, complaints])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-green-600" />
            <CardTitle>聚类分析</CardTitle>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleAutoCluster}
            disabled={complaints.length < 3 || isClustering}
          >
            <Sparkles className="h-4 w-4 mr-1" />
            {isClustering ? '分析中...' : '智能聚类'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex gap-2">
            {(Object.keys(DIMENSION_CONFIG) as DimensionType[]).map((dim) => (
              <button
                key={dim}
                onClick={() => setDimension(dim)}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                  dimension === dim
                    ? 'bg-green-50 border-green-500 text-green-700'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {DIMENSION_CONFIG[dim].label}
              </button>
            ))}
          </div>
        </div>

        {clusters.length === 0 ? (
          <div className="text-center py-8">
            <Layers className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-2 text-gray-500">暂无聚类</p>
            <p className="text-xs text-gray-400 mt-1">
              {complaints.length < 3 ? `需要至少3条抱怨才能聚类（当前${complaints.length}条）` : '点击智能聚类自动分析'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {clusterStats.map((cluster) => (
              <div key={cluster.id} className="rounded-lg border p-3 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    {editingId === cluster.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="h-8 text-sm"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRename(cluster.id)
                            if (e.key === 'Escape') setEditingId(null)
                          }}
                        />
                        <button onClick={() => handleRename(cluster.id)} className="p-1 text-green-600 hover:bg-green-50 rounded">
                          <Check className="h-4 w-4" />
                        </button>
                        <button onClick={() => setEditingId(null)} className="p-1 text-gray-400 hover:bg-gray-100 rounded">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{cluster.name}</span>
                        <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">
                          {cluster.count} 条抱怨
                        </span>
                        {cluster.type === 'system' && (
                          <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                            自动
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingId(cluster.id)
                        setEditName(cluster.name)
                      }}
                      className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cluster.id)}
                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {cluster.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {cluster.keywords.map((kw) => (
                      <span key={kw} className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded">
                        {kw}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}