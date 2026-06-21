'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Lightbulb, Plus, Trash2, X } from 'lucide-react'

interface PainPointExtractionProps {
  projectId: string
}

function ScoreSlider({
  label,
  value,
  onChange,
  color,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  color: string
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">{label}</span>
        <span className={`font-semibold text-${color}-600`}>{value}</span>
      </div>
      <input
        type="range"
        min="1"
        max="10"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-${color}-600`}
        style={{ accentColor: `var(--${color}-600)` }}
      />
      <div className="flex justify-between text-xs text-gray-400">
        <span>低</span>
        <span>高</span>
      </div>
    </div>
  )
}

export function PainPointExtraction({ projectId }: PainPointExtractionProps) {
  const { phase1Data, addPainPoints, updatePainPoint, removePainPoint } = useAppStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newPainPoint, setNewPainPoint] = useState({
    name: '',
    description: '',
    frequencyScore: 5,
    intensityScore: 5,
    paymentWillingness: 5,
  })
  const [selectedClusterId, setSelectedClusterId] = useState<string | undefined>()

  const painPoints = phase1Data.painPoints
  const clusters = phase1Data.clusters

  const calculateCompositeScore = (f: number, i: number, p: number) => {
    return ((f * i * p) / 100).toFixed(2)
  }

  const handleCreate = async () => {
    if (!newPainPoint.name.trim()) return

    try {
      const res = await fetch('/api/pain-points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          clusterId: selectedClusterId,
          name: newPainPoint.name,
          description: newPainPoint.description,
          frequencyScore: newPainPoint.frequencyScore,
          intensityScore: newPainPoint.intensityScore,
          paymentWillingness: newPainPoint.paymentWillingness,
        }),
      })

      if (!res.ok) throw new Error('Failed to create pain point')

      const data = await res.json()
      addPainPoints([data.painPoint])
      setNewPainPoint({
        name: '',
        description: '',
        frequencyScore: 5,
        intensityScore: 5,
        paymentWillingness: 5,
      })
      setSelectedClusterId(undefined)
      setIsModalOpen(false)
    } catch (error) {
      console.error('Failed to create pain point:', error)
    }
  }

  const handleUpdateScore = async (id: string, field: string, value: number) => {
    const painPoint = painPoints.find((p) => p.id === id)
    if (!painPoint) return

    updatePainPoint(id, { [field]: value })

    try {
      await fetch('/api/pain-points', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, [field]: value }),
      })
    } catch (error) {
      console.error('Failed to update pain point:', error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/pain-points?id=${id}`, { method: 'DELETE' })
      removePainPoint(id)
    } catch (error) {
      console.error('Failed to delete pain point:', error)
    }
  }

  const sortedPainPoints = [...painPoints].sort((a, b) => a.rank - b.rank)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            <CardTitle>痛点提炼</CardTitle>
          </div>
          <Button size="sm" onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            添加痛点
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {painPoints.length === 0 ? (
          <div className="text-center py-8">
            <Lightbulb className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-2 text-gray-500">暂无痛点</p>
            <p className="text-xs text-gray-400 mt-1">聚类后自动计算痛点评分</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedPainPoints.map((painPoint) => {
              const compositeScore = calculateCompositeScore(
                painPoint.frequencyScore,
                painPoint.intensityScore,
                painPoint.paymentWillingness
              )

              return (
                <div
                  key={painPoint.id}
                  className="rounded-lg border p-4 hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-lg">#{painPoint.rank}</span>
                        <span className="font-medium">{painPoint.name}</span>
                      </div>
                      {painPoint.description && (
                        <p className="text-sm text-gray-500 mt-1">{painPoint.description}</p>
                      )}
                      {painPoint.cluster && (
                        <span className="inline-block text-xs px-2 py-0.5 bg-gray-100 rounded mt-1">
                          {painPoint.cluster.name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{compositeScore}</div>
                        <div className="text-xs text-gray-400">综合评分</div>
                      </div>
                      <button
                        onClick={() => handleDelete(painPoint.id)}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <ScoreSlider
                      label="频率"
                      value={painPoint.frequencyScore}
                      onChange={(v) => handleUpdateScore(painPoint.id, 'frequencyScore', v)}
                      color="blue"
                    />
                    <ScoreSlider
                      label="强度"
                      value={painPoint.intensityScore}
                      onChange={(v) => handleUpdateScore(painPoint.id, 'intensityScore', v)}
                      color="red"
                    />
                    <ScoreSlider
                      label="付费意愿"
                      value={painPoint.paymentWillingness}
                      onChange={(v) => handleUpdateScore(painPoint.id, 'paymentWillingness', v)}
                      color="green"
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">添加痛点</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">痛点名称</label>
                <Input
                  value={newPainPoint.name}
                  onChange={(e) => setNewPainPoint({ ...newPainPoint, name: e.target.value })}
                  placeholder="例如：App经常崩溃"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">描述（可选）</label>
                <textarea
                  value={newPainPoint.description}
                  onChange={(e) => setNewPainPoint({ ...newPainPoint, description: e.target.value })}
                  placeholder="详细描述这个痛点..."
                  className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-20"
                />
              </div>

              {clusters.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">关联聚类（可选）</label>
                  <select
                    value={selectedClusterId || ''}
                    onChange={(e) => setSelectedClusterId(e.target.value || undefined)}
                    className="w-full h-10 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">不关联</option>
                    {clusters.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.count}条)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-3">
                <ScoreSlider
                  label={`频率 (${newPainPoint.frequencyScore})`}
                  value={newPainPoint.frequencyScore}
                  onChange={(v) => setNewPainPoint({ ...newPainPoint, frequencyScore: v })}
                  color="blue"
                />
                <ScoreSlider
                  label={`强度 (${newPainPoint.intensityScore})`}
                  value={newPainPoint.intensityScore}
                  onChange={(v) => setNewPainPoint({ ...newPainPoint, intensityScore: v })}
                  color="red"
                />
                <ScoreSlider
                  label={`付费意愿 (${newPainPoint.paymentWillingness})`}
                  value={newPainPoint.paymentWillingness}
                  onChange={(v) => setNewPainPoint({ ...newPainPoint, paymentWillingness: v })}
                  color="green"
                />
              </div>

              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-700">综合评分</span>
                  <span className="text-xl font-bold text-blue-600">
                    {calculateCompositeScore(
                      newPainPoint.frequencyScore,
                      newPainPoint.intensityScore,
                      newPainPoint.paymentWillingness
                    )}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                取消
              </Button>
              <Button onClick={handleCreate} disabled={!newPainPoint.name.trim()}>
                创建痛点
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}