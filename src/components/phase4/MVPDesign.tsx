'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface MVPFeature {
  name: string
  priority: 'P0' | 'P1' | 'P2' | 'P3'
  description?: string
  acceptanceCriteria?: string
}

interface MVP {
  id: string
  name: string
  description?: string | null
  type: string
  cost?: number | null
  timeline?: string | null
  features: MVPFeature[] | unknown[]
  status: string
}

interface MVPDesignProps {
  projectId: string
  mvps?: MVP[]
  onMVPsChange?: () => void
  onSelectMvp?: (mvp: { id: string; name: string } | null) => void
  selectedMvpId?: string | null
}

const MVP_TYPES = [
  { key: 'landing_page', label: '落地页', description: '验证价值主张，适合早期验证', cost: '¥0-500' },
  { key: 'prototype', label: '原型图', description: '验证交互体验，可用户测试', cost: '¥0-1000' },
  { key: 'manual', label: '手工原型', description: '验证核心价值，人工服务优先', cost: '¥1000-5000' },
  { key: 'functional', label: '功能MVP', description: '最小功能版本，小规模测试', cost: '¥5000+' },
]

const PRIORITY_COLORS = {
  P0: 'bg-red-100 text-red-700 border-red-200',
  P1: 'bg-orange-100 text-orange-700 border-orange-200',
  P2: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  P3: 'bg-gray-100 text-gray-600 border-gray-200',
}

const STATUS_LABELS = {
  planning: { label: '规划中', color: 'bg-blue-100 text-blue-700' },
  developing: { label: '开发中', color: 'bg-yellow-100 text-yellow-700' },
  testing: { label: '测试中', color: 'bg-purple-100 text-purple-700' },
  launched: { label: '已上线', color: 'bg-green-100 text-green-700' },
}

export function MVPDesign({
  projectId,
  mvps: initialMvps = [],
  onMVPsChange,
  onSelectMvp,
  selectedMvpId,
}: MVPDesignProps) {
  const [mvps, setMvps] = useState<MVP[]>(initialMvps)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedMvp, setSelectedMvp] = useState<MVP | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'landing_page' as const,
    cost: '',
    timeline: '',
    features: [] as MVPFeature[],
  })
  const [newFeature, setNewFeature] = useState({ name: '', priority: 'P1' as const, description: '', acceptanceCriteria: '' })

  const handleCreate = async () => {
    if (!formData.name.trim()) return

    try {
      const res = await fetch('/api/mvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          name: formData.name,
          description: formData.description,
          type: formData.type,
          cost: formData.cost ? parseFloat(formData.cost) : undefined,
          timeline: formData.timeline || undefined,
          features: formData.features,
        }),
      })
      const data = await res.json()
      if (data.mvp) {
        setMvps([...mvps, data.mvp])
        setFormData({ name: '', description: '', type: 'landing_page', cost: '', timeline: '', features: [] })
        setShowCreateForm(false)
        onMVPsChange?.()
      }
    } catch (err) {
      console.error('Failed to create MVP:', err)
    }
  }

  const handleUpdate = async (id: string, updates: Partial<MVP>) => {
    try {
      const res = await fetch('/api/mvp', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      })
      const data = await res.json()
      if (data.mvp) {
        setMvps(mvps.map((m) => (m.id === id ? data.mvp : m)))
        onMVPsChange?.()
      }
    } catch (err) {
      console.error('Failed to update MVP:', err)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/mvp?id=${id}`, { method: 'DELETE' })
      setMvps(mvps.filter((m) => m.id !== id))
      if (selectedMvpId === id) onSelectMvp?.(null)
      onMVPsChange?.()
    } catch (err) {
      console.error('Failed to delete MVP:', err)
    }
  }

  const handleSelectMvp = (mvp: MVP | null) => {
    if (mvp) {
      setSelectedMvp(mvp)
      onSelectMvp?.({ id: mvp.id, name: mvp.name })
    } else {
      setSelectedMvp(null)
      onSelectMvp?.(null)
    }
  }

  const addFeature = () => {
    if (!newFeature.name.trim()) return
    setFormData({
      ...formData,
      features: [...formData.features, { ...newFeature }],
    })
    setNewFeature({ name: '', priority: 'P1', description: '', acceptanceCriteria: '' })
  }

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">MVP设计</h3>
          <p className="text-sm text-gray-500 mt-1">
            设计最小可行产品，快速验证核心假设
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? '取消' : '+ 设计MVP'}
        </Button>
      </div>

      {/* 创建表单 */}
      {showCreateForm && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 space-y-4">
          <h4 className="font-medium text-orange-900">设计新MVP</h4>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">MVP名称</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="如：快速配送验证版"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">MVP形态</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as typeof formData.type })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                {MVP_TYPES.map((t) => (
                  <option key={t.key} value={t.key}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">一句话描述</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="描述MVP是什么、解决什么问题"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">预估成本</label>
              <input
                type="text"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                placeholder="如：¥5000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">预估周期</label>
              <input
                type="text"
                value={formData.timeline}
                onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                placeholder="如：2-3周"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* 功能清单 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">功能清单</label>
            <div className="space-y-2 mb-2">
              {formData.features.map((f, idx) => (
                <div key={idx} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${PRIORITY_COLORS[f.priority]}`}>{f.priority}</span>
                    <span>{f.name}</span>
                  </div>
                  <button onClick={() => removeFeature(idx)} className="text-gray-400 hover:text-red-500">✕</button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newFeature.name}
                onChange={(e) => setNewFeature({ ...newFeature, name: e.target.value })}
                placeholder="功能名称"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-sm"
              />
              <select
                value={newFeature.priority}
                onChange={(e) => setNewFeature({ ...newFeature, priority: e.target.value as typeof newFeature.priority })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-sm"
              >
                <option value="P0">P0</option>
                <option value="P1">P1</option>
                <option value="P2">P2</option>
                <option value="P3">P3</option>
              </select>
              <Button size="sm" variant="outline" onClick={addFeature}>添加</Button>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowCreateForm(false)}>取消</Button>
            <Button onClick={handleCreate}>创建MVP</Button>
          </div>
        </div>
      )}

      {/* MVP列表 */}
      {mvps.length === 0 && !showCreateForm ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <div className="text-6xl mb-4">🚀</div>
          <h4 className="text-lg font-medium text-gray-700 mb-2">还没有MVP</h4>
          <p className="text-gray-500 mb-6">开始设计你的第一个最小可行产品</p>
          <Button onClick={() => setShowCreateForm(true)}>设计MVP</Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {mvps.map((mvp) => {
            const mvpType = MVP_TYPES.find((t) => t.key === mvp.type)
            const statusInfo = STATUS_LABELS[mvp.status as keyof typeof STATUS_LABELS] || STATUS_LABELS.planning

            return (
              <div
                key={mvp.id}
                className={`bg-white border rounded-xl p-4 cursor-pointer transition-all ${
                  selectedMvpId === mvp.id ? 'border-orange-400 ring-2 ring-orange-100' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleSelectMvp(selectedMvpId === mvp.id ? null : mvp)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900">{mvp.name}</h4>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${statusInfo.color}`}>{statusInfo.label}</span>
                    </div>
                    {mvp.description && (
                      <p className="text-sm text-gray-500 mb-2">{mvp.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>{mvpType?.label}</span>
                      {mvp.cost && <span>{mvp.cost}</span>}
                      {mvp.timeline && <span>{mvp.timeline}</span>}
                      <span>{mvp.features.length}个功能</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <select
                      value={mvp.status}
                      onChange={(e) => handleUpdate(mvp.id, { status: e.target.value })}
                      onClick={(e) => e.stopPropagation()}
                      className="text-sm border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="planning">规划中</option>
                      <option value="developing">开发中</option>
                      <option value="testing">测试中</option>
                      <option value="launched">已上线</option>
                    </select>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(mvp.id)
                      }}
                      className="text-gray-400 hover:text-red-500"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* 展开显示功能详情 */}
                {selectedMvpId === mvp.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">功能清单</h5>
                    <div className="space-y-2">
                      {['P0', 'P1', 'P2', 'P3'].map((priority) => {
                        const features = (mvp.features as MVPFeature[]).filter((f) => f.priority === priority)
                        if (features.length === 0) return null
                        return (
                          <div key={priority}>
                            <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded mb-1 ${PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS]}`}>
                              {priority === 'P0' ? 'P0 - 必须有' : priority === 'P1' ? 'P1 - 应该有' : priority === 'P2' ? 'P2 - 可以有' : 'P3 - 暂不做'}
                            </span>
                            <div className="space-y-1 ml-2">
                              {features.map((f, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-sm">
                                  <span className="text-gray-400">□</span>
                                  <span>{f.name}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
