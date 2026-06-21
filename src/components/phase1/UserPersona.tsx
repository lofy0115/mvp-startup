'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Users, Plus, Trash2, Edit2, X, Star, User, Target, AlertTriangle } from 'lucide-react'

interface UserPersonaProps {
  projectId: string
}

interface PersonaType {
  id: string
  projectId: string
  name: string
  demographics: string
  behaviors: string
  description: string | null
  priority: number
  isPrimary: boolean
  createdAt: string
  painPoints: Array<{
    id: string
    painPoint: {
      id: string
      name: string
      rank: number
    }
  }>
}

const DEMOGRAPHICS_FIELDS = [
  { key: 'ageRange', label: '年龄段', placeholder: '如：25-35岁' },
  { key: 'occupation', label: '职业', placeholder: '如：互联网从业者' },
  { key: 'region', label: '地区', placeholder: '如：一线城市' },
  { key: 'income', label: '收入水平', placeholder: '如：15-30万' },
  { key: 'education', label: '教育背景', placeholder: '如：本科' },
]

const BEHAVIORS_FIELDS = [
  { key: 'usageFrequency', label: '使用频率', placeholder: '如：每天多次' },
  { key: 'paymentHabit', label: '付费习惯', placeholder: '如：愿意为高质量付费' },
  { key: 'decisionCycle', label: '决策周期', placeholder: '如：1-2周' },
  { key: 'infoChannel', label: '信息渠道', placeholder: '如：社交媒体' },
]

function PersonaCard({
  persona,
  onEdit,
  onDelete,
}: {
  persona: PersonaType
  onEdit: () => void
  onDelete: () => void
}) {
  const demographics = JSON.parse(persona.demographics || '{}')
  const behaviors = JSON.parse(persona.behaviors || '{}')

  return (
    <div className="relative bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-5 border border-purple-100">
      <div className="absolute top-3 right-3 flex gap-1">
        <button onClick={onEdit} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
          <Edit2 className="h-4 w-4" />
        </button>
        <button onClick={onDelete} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-purple-200 flex items-center justify-center">
          <User className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            {persona.name}
            {persona.isPrimary && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                <Star className="h-3 w-3" /> 核心用户
              </span>
            )}
          </h4>
          <p className="text-sm text-gray-500">{persona.description}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-1.5 mb-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
            <User className="h-3 w-3" /> 人口属性
          </div>
          <div className="grid grid-cols-2 gap-2">
            {DEMOGRAPHICS_FIELDS.map((field) => (
              <div key={field.key} className="text-sm">
                <span className="text-gray-500">{field.label}:</span>{' '}
                <span className="font-medium text-gray-700">{demographics[field.key] || '-'}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
            <Target className="h-3 w-3" /> 行为特征
          </div>
          <div className="grid grid-cols-2 gap-2">
            {BEHAVIORS_FIELDS.map((field) => (
              <div key={field.key} className="text-sm">
                <span className="text-gray-500">{field.label}:</span>{' '}
                <span className="font-medium text-gray-700">{behaviors[field.key] || '-'}</span>
              </div>
            ))}
          </div>
        </div>

        {persona.painPoints && persona.painPoints.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <AlertTriangle className="h-3 w-3" /> 关联痛点
            </div>
            <div className="flex flex-wrap gap-1.5">
              {persona.painPoints.map((pp) => (
                <span
                  key={pp.painPoint.id}
                  className="text-xs px-2 py-1 bg-red-50 text-red-700 rounded-lg border border-red-100"
                >
                  #{pp.painPoint.rank} {pp.painPoint.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-purple-100 flex items-center justify-between">
        <span className="text-xs text-gray-400">
          优先级: P{persona.priority}
        </span>
        <span className="text-xs text-gray-400">
          {new Date(persona.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  )
}

export function UserPersona({ projectId }: UserPersonaProps) {
  const { phase1Data, addPersonas, updatePersona, removePersona } = useAppStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPersona, setEditingPersona] = useState<PersonaType | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    demographics: {} as Record<string, string>,
    behaviors: {} as Record<string, string>,
    priority: 3,
    isPrimary: false,
    painPointIds: [] as string[],
  })

  const personas = phase1Data.personas
  const painPoints = phase1Data.painPoints

  const openCreateModal = () => {
    setEditingPersona(null)
    setFormData({
      name: '',
      description: '',
      demographics: {},
      behaviors: {},
      priority: 3,
      isPrimary: false,
      painPointIds: [],
    })
    setIsModalOpen(true)
  }

  const openEditModal = (persona: PersonaType) => {
    setEditingPersona(persona)
    const demographics = JSON.parse(persona.demographics || '{}')
    const behaviors = JSON.parse(persona.behaviors || '{}')
    setFormData({
      name: persona.name,
      description: persona.description || '',
      demographics,
      behaviors,
      priority: persona.priority,
      isPrimary: persona.isPrimary,
      painPointIds: persona.painPoints?.map((pp) => pp.painPoint.id) || [],
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) return

    try {
      if (editingPersona) {
        const res = await fetch('/api/personas', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingPersona.id,
            name: formData.name,
            demographics: JSON.stringify(formData.demographics),
            behaviors: JSON.stringify(formData.behaviors),
            description: formData.description,
            priority: formData.priority,
            isPrimary: formData.isPrimary,
            painPointIds: formData.painPointIds,
          }),
        })

        if (!res.ok) throw new Error('Failed to update persona')
        const data = await res.json()
        updatePersona(editingPersona.id, data.persona)
      } else {
        const res = await fetch('/api/personas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId,
            name: formData.name,
            demographics: JSON.stringify(formData.demographics),
            behaviors: JSON.stringify(formData.behaviors),
            description: formData.description,
            priority: formData.priority,
            isPrimary: formData.isPrimary,
            painPointIds: formData.painPointIds,
          }),
        })

        if (!res.ok) throw new Error('Failed to create persona')
        const data = await res.json()
        addPersonas([data.persona])
      }

      setIsModalOpen(false)
    } catch (error) {
      console.error('Failed to save persona:', error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/personas?id=${id}`, { method: 'DELETE' })
      removePersona(id)
    } catch (error) {
      console.error('Failed to delete persona:', error)
    }
  }

  const togglePainPoint = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      painPointIds: prev.painPointIds.includes(id)
        ? prev.painPointIds.filter((ppId) => ppId !== id)
        : [...prev.painPointIds, id],
    }))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            <CardTitle>用户画像</CardTitle>
          </div>
          <Button size="sm" variant="outline" onClick={openCreateModal}>
            <Plus className="h-4 w-4 mr-1" />
            新建画像
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {personas.length === 0 ? (
          <div className="text-center py-8">
            <Users className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-2 text-gray-500">暂无画像</p>
            <p className="text-xs text-gray-400 mt-1">基于痛点创建目标用户画像</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {personas.map((persona) => (
              <PersonaCard
                key={persona.id}
                persona={persona}
                onEdit={() => openEditModal(persona)}
                onDelete={() => handleDelete(persona.id)}
              />
            ))}
          </div>
        )}
      </CardContent>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">
                {editingPersona ? '编辑用户画像' : '新建用户画像'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">画像名称 *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例如：追求效率的年轻白领"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">一句话描述</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="用一句话描述这个用户群体"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">基本信息</label>
                <div className="grid grid-cols-2 gap-3">
                  {DEMOGRAPHICS_FIELDS.map((field) => (
                    <div key={field.key}>
                      <label className="block text-xs text-gray-500 mb-1">{field.label}</label>
                      <Input
                        value={formData.demographics[field.key] || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            demographics: { ...formData.demographics, [field.key]: e.target.value },
                          })
                        }
                        placeholder={field.placeholder}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">行为特征</label>
                <div className="grid grid-cols-2 gap-3">
                  {BEHAVIORS_FIELDS.map((field) => (
                    <div key={field.key}>
                      <label className="block text-xs text-gray-500 mb-1">{field.label}</label>
                      <Input
                        value={formData.behaviors[field.key] || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            behaviors: { ...formData.behaviors, [field.key]: e.target.value },
                          })
                        }
                        placeholder={field.placeholder}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">优先级</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((p) => (
                      <button
                        key={p}
                        onClick={() => setFormData({ ...formData, priority: p })}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                          formData.priority === p
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        P{p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPrimary"
                    checked={formData.isPrimary}
                    onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })}
                    className="w-4 h-4 text-purple-600 rounded"
                  />
                  <label htmlFor="isPrimary" className="text-sm text-gray-700">
                    设为核心用户画像
                  </label>
                </div>
              </div>

              {painPoints.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">关联痛点</label>
                  <div className="flex flex-wrap gap-2">
                    {painPoints.map((pp) => (
                      <button
                        key={pp.id}
                        onClick={() => togglePainPoint(pp.id)}
                        className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${
                          formData.painPointIds.includes(pp.id)
                            ? 'bg-red-50 border-red-300 text-red-700'
                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        #{pp.rank} {pp.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                取消
              </Button>
              <Button onClick={handleSubmit} disabled={!formData.name.trim()}>
                {editingPersona ? '保存修改' : '创建画像'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}