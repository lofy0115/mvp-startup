'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Persona {
  id: string
  name: string
  demographics: string
  behaviors: string
  description?: string | null
}

interface Assumption {
  id: string
  personaId: string
  type: string
  content: string
  validationMethod?: string | null
  validationStatus: string
  evidence?: string | null
  priority: number
  persona?: Persona
}

interface AssumptionBuildingProps {
  projectId: string
  personas: Persona[]
  assumptions?: Assumption[]
  onAssumptionsChange?: () => void
}

const ASSUMPTION_TYPES = [
  { key: 'problem', label: '问题假设', description: '目标用户是否真的存在这个痛点？' },
  { key: 'solution', label: '解决方案假设', description: '我们的产品能否真正解决这个痛点？' },
  { key: 'value', label: '价值假设', description: '用户是否认为解决方案有价值？' },
  { key: 'market', label: '市场规模假设', description: '这个细分市场是否足够大？' },
  { key: 'channel', label: '获客假设', description: '我们能否有效触达目标用户？' },
  { key: 'retention', label: '留存假设', description: '用户是否会持续使用并付费？' },
]

const VALIDATION_METHODS = [
  { key: 'interview', label: '用户访谈' },
  { key: 'survey', label: '问卷调研' },
  { key: 'data', label: '数据分析' },
  { key: 'competitor', label: '竞品分析' },
  { key: 'intuition', label: '直觉判断' },
]

const VALIDATION_STATUSES = [
  { key: 'pending', label: '待验证', color: 'bg-gray-100 text-gray-600' },
  { key: 'validating', label: '验证中', color: 'bg-yellow-100 text-yellow-700' },
  { key: 'validated', label: '已验证', color: 'bg-green-100 text-green-700' },
  { key: 'disproved', label: '已推翻', color: 'bg-red-100 text-red-700' },
]

export function AssumptionBuilding({
  projectId,
  personas,
  assumptions: initialAssumptions = [],
  onAssumptionsChange,
}: AssumptionBuildingProps) {
  const [assumptions, setAssumptions] = useState<Assumption[]>(initialAssumptions)
  const [selectedPersona, setSelectedPersona] = useState<string>(personas[0]?.id || '')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    type: 'problem',
    content: '',
    validationMethod: 'intuition',
    validationStatus: 'pending',
    evidence: '',
    priority: 3,
  })

  const currentPersona = personas.find((p) => p.id === selectedPersona)
  const personaAssumptions = assumptions.filter((a) => a.personaId === selectedPersona)

  const handleCreate = async () => {
    if (!formData.content.trim()) return

    try {
      const res = await fetch('/api/assumptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personaId: selectedPersona,
          ...formData,
        }),
      })
      const data = await res.json()
      if (data.assumption) {
        setAssumptions([...assumptions, data.assumption])
        setFormData({
          type: 'problem',
          content: '',
          validationMethod: 'intuition',
          validationStatus: 'pending',
          evidence: '',
          priority: 3,
        })
        setShowForm(false)
        onAssumptionsChange?.()
      }
    } catch (err) {
      console.error('Failed to create assumption:', err)
    }
  }

  const handleUpdate = async (id: string, updates: Partial<Assumption>) => {
    try {
      const res = await fetch('/api/assumptions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      })
      const data = await res.json()
      if (data.assumption) {
        setAssumptions(assumptions.map((a) => (a.id === id ? data.assumption : a)))
        onAssumptionsChange?.()
      }
    } catch (err) {
      console.error('Failed to update assumption:', err)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/assumptions?id=${id}`, { method: 'DELETE' })
      setAssumptions(assumptions.filter((a) => a.id !== id))
      onAssumptionsChange?.()
    } catch (err) {
      console.error('Failed to delete assumption:', err)
    }
  }

  const getStatusColor = (status: string) => {
    return VALIDATION_STATUSES.find((s) => s.key === status)?.color || 'bg-gray-100'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">假设建立</h3>
          <p className="text-sm text-gray-500 mt-1">
            基于用户画像，建立需要验证的商业假设
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? '取消' : '+ 添加假设'}
        </Button>
      </div>

      {/* 画像选择 */}
      <div className="flex gap-2 flex-wrap">
        {personas.map((persona) => (
          <button
            key={persona.id}
            onClick={() => setSelectedPersona(persona.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedPersona === persona.id
                ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                : 'bg-gray-50 text-gray-600 border-2 border-transparent hover:bg-gray-100'
            }`}
          >
            {persona.name}
          </button>
        ))}
      </div>

      {/* 新建假设表单 */}
      {showForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 space-y-4">
          <h4 className="font-medium text-blue-900">新建假设</h4>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">假设类型</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {ASSUMPTION_TYPES.map((t) => (
                  <option key={t.key} value={t.key}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">验证方式</label>
              <select
                value={formData.validationMethod}
                onChange={(e) => setFormData({ ...formData, validationMethod: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {VALIDATION_METHODS.map((m) => (
                  <option key={m.key} value={m.key}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {ASSUMPTION_TYPES.find((t) => t.key === formData.type)?.description}
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="描述你的假设..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowForm(false)}>
              取消
            </Button>
            <Button onClick={handleCreate}>保存假设</Button>
          </div>
        </div>
      )}

      {/* 假设列表 */}
      <div className="space-y-3">
        {personaAssumptions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>还没有假设</p>
            <p className="text-sm mt-1">点击&quot;添加假设&quot;开始建立你的商业假设</p>
          </div>
        ) : (
          personaAssumptions.map((assumption) => {
            const typeInfo = ASSUMPTION_TYPES.find((t) => t.key === assumption.type)
            const statusInfo = VALIDATION_STATUSES.find((s) => s.key === assumption.validationStatus)

            return (
              <div
                key={assumption.id}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                        {typeInfo?.label}
                      </span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${getStatusColor(assumption.validationStatus)}`}>
                        {statusInfo?.label}
                      </span>
                    </div>
                    <p className="text-gray-900 mb-2">{assumption.content}</p>
                    {assumption.evidence && (
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">已有证据：</span>
                        {assumption.evidence}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <select
                      value={assumption.validationStatus}
                      onChange={(e) =>
                        handleUpdate(assumption.id, { validationStatus: e.target.value })
                      }
                      className="text-sm border border-gray-300 rounded px-2 py-1"
                    >
                      {VALIDATION_STATUSES.map((s) => (
                        <option key={s.key} value={s.key}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleDelete(assumption.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* 假设统计 */}
      {assumptions.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-4">
          <h4 className="font-medium text-gray-700 mb-3">假设概览</h4>
          <div className="grid grid-cols-4 gap-4 text-center">
            {VALIDATION_STATUSES.map((status) => {
              const count = assumptions.filter((a) => a.validationStatus === status.key).length
              return (
                <div key={status.key}>
                  <div className={`text-2xl font-bold ${status.key === 'validated' ? 'text-green-600' : status.key === 'disproved' ? 'text-red-600' : 'text-gray-600'}`}>
                    {count}
                  </div>
                  <div className="text-sm text-gray-500">{status.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
