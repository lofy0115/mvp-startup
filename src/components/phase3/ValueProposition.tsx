'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface Persona {
  id: string
  name: string
  demographics: string
  behaviors: string
  description?: string | null
}

interface PainPoint {
  id: string
  name: string
  description?: string | null
  compositeScore: number
}

interface ValueProposition {
  id: string
  personaId: string
  jobs: string[]
  pains: string[]
  gains: string[]
  painRelievers: string[]
  gainsCreators: string[]
  statement?: string | null
}

interface ValuePropositionProps {
  projectId: string
  personas: Persona[]
  painPoints: PainPoint[]
  valueProposition?: ValueProposition
  onValuePropositionChange?: () => void
}

export function ValueProposition({
  projectId,
  personas,
  painPoints,
  valueProposition: initialValueProp,
  onValuePropositionChange,
}: ValuePropositionProps) {
  const [selectedPersona, setSelectedPersona] = useState<string>(personas[0]?.id || '')
  const [valueProp, setValueProp] = useState<ValueProposition | null>(initialValueProp || null)
  const [editingCell, setEditingCell] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const currentPersona = personas.find((p) => p.id === selectedPersona)
  const linkedPainPoints = painPoints.slice(0, 3) // Top 3 pain points

  const loadValueProposition = async () => {
    try {
      const res = await fetch(`/api/value-propositions?personaId=${selectedPersona}`)
      const data = await res.json()
      if (data.valuePropositions && data.valuePropositions.length > 0) {
        setValueProp(data.valuePropositions[0])
      } else {
        // Create new
        const createRes = await fetch('/api/value-propositions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId,
            personaId: selectedPersona,
            jobs: [],
            pains: linkedPainPoints.map((p) => p.name),
            gains: [],
            painRelievers: [],
            gainsCreators: [],
          }),
        })
        const createData = await createRes.json()
        if (createData.valueProposition) {
          setValueProp(createData.valueProposition)
        }
      }
    } catch (err) {
      console.error('Failed to load value proposition:', err)
    }
  }

  const handleCreate = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/value-propositions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          personaId: selectedPersona,
          jobs: [],
          pains: linkedPainPoints.map((p) => p.name),
          gains: [],
          painRelievers: [],
          gainsCreators: [],
        }),
      })
      const data = await res.json()
      if (data.valueProposition) {
        setValueProp(data.valueProposition)
        onValuePropositionChange?.()
      }
    } catch (err) {
      console.error('Failed to create value proposition:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdate = async (field: string, value: string[] | string) => {
    if (!valueProp) return

    try {
      const res = await fetch('/api/value-propositions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: valueProp.id,
          [field]: value,
        }),
      })
      const data = await res.json()
      if (data.valueProposition) {
        setValueProp(data.valueProposition)
        onValuePropositionChange?.()
      }
    } catch (err) {
      console.error('Failed to update value proposition:', err)
    }
  }

  const handleAddItem = (field: string) => {
    if (!inputValue.trim() || !valueProp) return

    const currentValue = (valueProp as unknown as Record<string, string[]>)[field] || []
    handleUpdate(field, [...currentValue, inputValue.trim()])
    setInputValue('')
    setEditingCell(null)
  }

  const handleRemoveItem = (field: string, index: number) => {
    if (!valueProp) return

    const currentValue = (valueProp as unknown as Record<string, string[]>)[field] || []
    handleUpdate(field, currentValue.filter((_, i) => i !== index))
  }

  const generateStatement = () => {
    if (!valueProp) return ''

    const personaName = currentPersona?.name || '目标用户'
    const pain = valueProp.pains[0] || '核心痛点'
    const gain = valueProp.gains[0] || '主要收益'
    const reliever = valueProp.painRelievers[0] || '解决方案'

    return `帮助${personaName}通过${reliever}，达成${gain}，解决${pain}问题`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">价值主张设计</h3>
          <p className="text-sm text-gray-500 mt-1">
            基于用户痛点，设计清晰的价值主张
          </p>
        </div>
      </div>

      {/* 画像选择 */}
      <div className="flex gap-2 flex-wrap">
        {personas.map((persona) => (
          <button
            key={persona.id}
            onClick={() => {
              setSelectedPersona(persona.id)
              setValueProp(null)
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedPersona === persona.id
                ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                : 'bg-gray-50 text-gray-600 border-2 border-transparent hover:bg-gray-100'
            }`}
          >
            {persona.name}
          </button>
        ))}
      </div>

      {/* 价值主张画布 */}
      {!valueProp ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <div className="text-6xl mb-4">💡</div>
          <h4 className="text-lg font-medium text-gray-700 mb-2">创建价值主张</h4>
          <p className="text-gray-500 mb-6">基于用户画像和痛点，设计独特价值主张</p>
          <Button onClick={handleCreate} disabled={isLoading}>
            {isLoading ? '创建中...' : '创建价值主张'}
          </Button>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
          {/* 目标用户 */}
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
            <h4 className="font-medium text-purple-900 mb-2">🎯 目标用户</h4>
            <p className="text-purple-800">{currentPersona?.name}</p>
            {currentPersona?.description && (
              <p className="text-sm text-purple-600 mt-1">{currentPersona.description}</p>
            )}
          </div>

          {/* 用户工作 */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h4 className="font-medium text-blue-900 mb-2">⚡ 用户工作 (Jobs)</h4>
            <p className="text-xs text-blue-600 mb-2">用户正在尝试完成什么？</p>
            <div className="space-y-2">
              {(valueProp.jobs || []).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between bg-white/50 rounded px-2 py-1 text-sm">
                  <span>{item}</span>
                  <button onClick={() => handleRemoveItem('jobs', idx)} className="text-gray-400 hover:text-red-500">✕</button>
                </div>
              ))}
              {editingCell === 'jobs' ? (
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddItem('jobs')}
                    className="flex-1 bg-white border border-gray-200 rounded px-2 py-1 text-sm"
                    autoFocus
                  />
                  <button onClick={() => handleAddItem('jobs')} className="text-blue-600">✓</button>
                  <button onClick={() => { setEditingCell(null); setInputValue(''); }} className="text-gray-400">✕</button>
                </div>
              ) : (
                <button onClick={() => setEditingCell('jobs')} className="text-sm text-blue-500 hover:text-blue-700">+ 添加</button>
              )}
            </div>
          </div>

          {/* 痛点 */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <h4 className="font-medium text-red-900 mb-2">😤 用户的痛点 (Pains)</h4>
            <p className="text-xs text-red-600 mb-2">用户在完成工作中遇到了什么问题？</p>
            <div className="space-y-2">
              {(valueProp.pains || []).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between bg-white/50 rounded px-2 py-1 text-sm">
                  <span>{item}</span>
                  <button onClick={() => handleRemoveItem('pains', idx)} className="text-gray-400 hover:text-red-500">✕</button>
                </div>
              ))}
              {editingCell === 'pains' ? (
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddItem('pains')}
                    className="flex-1 bg-white border border-gray-200 rounded px-2 py-1 text-sm"
                    autoFocus
                  />
                  <button onClick={() => handleAddItem('pains')} className="text-blue-600">✓</button>
                  <button onClick={() => { setEditingCell(null); setInputValue(''); }} className="text-gray-400">✕</button>
                </div>
              ) : (
                <button onClick={() => setEditingCell('pains')} className="text-sm text-red-500 hover:text-red-700">+ 添加</button>
              )}
            </div>
          </div>

          {/* 收益 */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <h4 className="font-medium text-green-900 mb-2">✨ 用户的收益 (Gains)</h4>
            <p className="text-xs text-green-600 mb-2">用户期望获得什么正面结果？</p>
            <div className="space-y-2">
              {(valueProp.gains || []).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between bg-white/50 rounded px-2 py-1 text-sm">
                  <span>{item}</span>
                  <button onClick={() => handleRemoveItem('gains', idx)} className="text-gray-400 hover:text-red-500">✕</button>
                </div>
              ))}
              {editingCell === 'gains' ? (
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddItem('gains')}
                    className="flex-1 bg-white border border-gray-200 rounded px-2 py-1 text-sm"
                    autoFocus
                  />
                  <button onClick={() => handleAddItem('gains')} className="text-blue-600">✓</button>
                  <button onClick={() => { setEditingCell(null); setInputValue(''); }} className="text-gray-400">✕</button>
                </div>
              ) : (
                <button onClick={() => setEditingCell('gains')} className="text-sm text-green-500 hover:text-green-700">+ 添加</button>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h4 className="font-medium text-gray-700 mb-4">💊 你的产品如何帮助用户？</h4>
            <div className="grid grid-cols-2 gap-4">
              {/* 止痛药 */}
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                <h5 className="font-medium text-orange-900 mb-2">🩹 止痛药 (Pain Relievers)</h5>
                <p className="text-xs text-orange-600 mb-2">减少/消除用户的痛苦</p>
                <div className="space-y-2">
                  {(valueProp.painRelievers || []).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white/50 rounded px-2 py-1 text-sm">
                      <span>{item}</span>
                      <button onClick={() => handleRemoveItem('painRelievers', idx)} className="text-gray-400 hover:text-red-500">✕</button>
                    </div>
                  ))}
                  {editingCell === 'painRelievers' ? (
                    <div className="flex gap-1">
                      <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddItem('painRelievers')}
                        className="flex-1 bg-white border border-gray-200 rounded px-2 py-1 text-sm"
                        autoFocus
                      />
                      <button onClick={() => handleAddItem('painRelievers')} className="text-blue-600">✓</button>
                      <button onClick={() => { setEditingCell(null); setInputValue(''); }} className="text-gray-400">✕</button>
                    </div>
                  ) : (
                    <button onClick={() => setEditingCell('painRelievers')} className="text-sm text-orange-500 hover:text-orange-700">+ 添加</button>
                  )}
                </div>
              </div>

              {/* 增效益 */}
              <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
                <h5 className="font-medium text-teal-900 mb-2">🚀 增效益 (Gains Creators)</h5>
                <p className="text-xs text-teal-600 mb-2">为用户创造额外价值</p>
                <div className="space-y-2">
                  {(valueProp.gainsCreators || []).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white/50 rounded px-2 py-1 text-sm">
                      <span>{item}</span>
                      <button onClick={() => handleRemoveItem('gainsCreators', idx)} className="text-gray-400 hover:text-red-500">✕</button>
                    </div>
                  ))}
                  {editingCell === 'gainsCreators' ? (
                    <div className="flex gap-1">
                      <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddItem('gainsCreators')}
                        className="flex-1 bg-white border border-gray-200 rounded px-2 py-1 text-sm"
                        autoFocus
                      />
                      <button onClick={() => handleAddItem('gainsCreators')} className="text-blue-600">✓</button>
                      <button onClick={() => { setEditingCell(null); setInputValue(''); }} className="text-gray-400">✕</button>
                    </div>
                  ) : (
                    <button onClick={() => setEditingCell('gainsCreators')} className="text-sm text-teal-500 hover:text-teal-700">+ 添加</button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 价值主张宣言 */}
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl p-6 text-white">
            <h4 className="font-medium mb-3">💡 价值主张宣言</h4>
            <p className="text-white/90 mb-4">
              {valueProp.statement || generateStatement()}
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleUpdate('statement', generateStatement())}
            >
              生成/更新宣言
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
