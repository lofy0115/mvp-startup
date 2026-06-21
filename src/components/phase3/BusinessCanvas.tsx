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

interface BusinessCanvasData {
  keyPartners: string[]
  keyActivities: string[]
  keyResources: string[]
  valuePropositions: string[]
  customerRelationships: string[]
  channels: string[]
  customerSegments: string[]
  costStructure: string[]
  revenueStreams: string[]
}

interface BusinessCanvas {
  id: string
  personaId: string
  type: string
  data: BusinessCanvasData | unknown
  completeness: number
  persona?: Persona
}

interface BusinessCanvasProps {
  projectId: string
  personas: Persona[]
  businessCanvas?: BusinessCanvas[]
  onBusinessCanvasChange?: () => void
}

const CANVAS_CELLS = [
  {
    key: 'keyPartners',
    title: '合作伙伴',
    subtitle: '谁帮你？',
    color: 'bg-gray-50 border-gray-200',
  },
  {
    key: 'keyActivities',
    title: '关键业务',
    subtitle: '做什么？',
    color: 'bg-blue-50 border-blue-200',
  },
  {
    key: 'keyResources',
    title: '核心资源',
    subtitle: '有什么？',
    color: 'bg-purple-50 border-purple-200',
  },
  {
    key: 'valuePropositions',
    title: '价值主张',
    subtitle: '提供什么？',
    color: 'bg-red-50 border-red-200',
  },
  {
    key: 'customerRelationships',
    title: '客户关系',
    subtitle: '怎么维护？',
    color: 'bg-pink-50 border-pink-200',
  },
  {
    key: 'channels',
    title: '渠道通路',
    subtitle: '怎么卖？',
    color: 'bg-green-50 border-green-200',
  },
  {
    key: 'customerSegments',
    title: '客户细分',
    subtitle: '为谁创造价值？',
    color: 'bg-yellow-50 border-yellow-200',
  },
  {
    key: 'costStructure',
    title: '成本结构',
    subtitle: '花多少钱？',
    color: 'bg-orange-50 border-orange-200',
  },
  {
    key: 'revenueStreams',
    title: '收入来源',
    subtitle: '赚多少钱？',
    color: 'bg-emerald-50 border-emerald-200',
  },
]

export function BusinessCanvas({
  projectId,
  personas,
  businessCanvas: initialCanvas = [],
  onBusinessCanvasChange,
}: BusinessCanvasProps) {
  const [selectedPersona, setSelectedPersona] = useState<string>(personas[0]?.id || '')
  const [canvasList, setCanvasList] = useState<BusinessCanvas[]>(initialCanvas)
  const [editingCanvas, setEditingCanvas] = useState<BusinessCanvasData | null>(null)
  const [activeCell, setActiveCell] = useState<string | null>(null)
  const [cellInput, setCellInput] = useState('')

  const currentCanvas = canvasList.find((c) => c.personaId === selectedPersona)

  const handleCreateCanvas = async () => {
    try {
      const res = await fetch('/api/business-canvas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personaId: selectedPersona,
          projectId,
          data: {
            keyPartners: [],
            keyActivities: [],
            keyResources: [],
            valuePropositions: [],
            customerRelationships: [],
            channels: [],
            customerSegments: [],
            costStructure: [],
            revenueStreams: [],
          },
        }),
      })
      const data = await res.json()
      if (data.canvas) {
        setCanvasList([...canvasList, data.canvas])
        setEditingCanvas(data.canvas.data as BusinessCanvasData)
        onBusinessCanvasChange?.()
      }
    } catch (err) {
      console.error('Failed to create business canvas:', err)
    }
  }

  const handleUpdateCell = async (key: string, value: string[]) => {
    if (!currentCanvas || !editingCanvas) return

    const newData = { ...editingCanvas, [key]: value } as BusinessCanvasData

    try {
      const res = await fetch('/api/business-canvas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentCanvas.id,
          data: newData,
        }),
      })
      const data = await res.json()
      if (data.canvas) {
        setCanvasList(canvasList.map((c) => (c.id === currentCanvas.id ? data.canvas : c)))
        setEditingCanvas(newData)
        onBusinessCanvasChange?.()
      }
    } catch (err) {
      console.error('Failed to update business canvas:', err)
    }
  }

  const handleAddItem = (key: string) => {
    if (!cellInput.trim() || !editingCanvas) return

    const currentValue = editingCanvas[key as keyof BusinessCanvasData] || []
    handleUpdateCell(key, [...currentValue, cellInput.trim()])
    setCellInput('')
    setActiveCell(null)
  }

  const handleRemoveItem = (key: string, index: number) => {
    if (!editingCanvas) return

    const currentValue = editingCanvas[key as keyof BusinessCanvasData] || []
    handleUpdateCell(key, currentValue.filter((_, i) => i !== index))
  }

  const completeness = currentCanvas?.completeness || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">商业画布</h3>
          <p className="text-sm text-gray-500 mt-1">
            设计完整的商业模式，9宫格战略画布
          </p>
        </div>
        <div className="flex items-center gap-4">
          {completeness > 0 && (
            <div className="text-sm">
              <span className="text-gray-500">完整度：</span>
              <span className="font-medium text-purple-600">{Math.round(completeness)}%</span>
            </div>
          )}
        </div>
      </div>

      {/* 画像选择 */}
      <div className="flex gap-2 flex-wrap">
        {personas.map((persona) => (
          <button
            key={persona.id}
            onClick={() => {
              setSelectedPersona(persona.id)
              setEditingCanvas(null)
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

      {/* 画布内容 */}
      {!editingCanvas && !currentCanvas ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <div className="text-6xl mb-4">📊</div>
          <h4 className="text-lg font-medium text-gray-700 mb-2">还没有商业画布</h4>
          <p className="text-gray-500 mb-6">为这个用户画像创建一个商业画布</p>
          <Button onClick={handleCreateCanvas}>创建商业画布</Button>
        </div>
      ) : editingCanvas ? (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          {/* 上部4格 */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            {CANVAS_CELLS.slice(0, 4).map((cell) => (
              <div key={cell.key} className={`${cell.color} border rounded-xl p-4`}>
                <h5 className="font-medium text-gray-800">{cell.title}</h5>
                <p className="text-xs text-gray-500 mb-2">{cell.subtitle}</p>
                <div className="space-y-2">
                  {(editingCanvas[cell.key as keyof BusinessCanvasData] || []).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white/50 rounded px-2 py-1 text-sm">
                      <span className="truncate">{item}</span>
                      <button onClick={() => handleRemoveItem(cell.key, idx)} className="text-gray-400 hover:text-red-500 ml-1">✕</button>
                    </div>
                  ))}
                  {activeCell === cell.key ? (
                    <div className="flex gap-1">
                      <input
                        type="text"
                        value={cellInput}
                        onChange={(e) => setCellInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddItem(cell.key)}
                        placeholder="输入..."
                        className="flex-1 bg-white border border-gray-200 rounded px-2 py-1 text-sm"
                        autoFocus
                      />
                      <button onClick={() => handleAddItem(cell.key)} className="text-blue-600">✓</button>
                      <button onClick={() => { setActiveCell(null); setCellInput(''); }} className="text-gray-400">✕</button>
                    </div>
                  ) : (
                    <button onClick={() => setActiveCell(cell.key)} className="text-sm text-gray-500 hover:text-gray-700">+ 添加</button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* 中部2格 */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="row-span-2 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <h5 className="font-medium text-gray-800">客户细分</h5>
              <p className="text-xs text-gray-500 mb-2">为谁创造价值？</p>
              <div className="space-y-2">
                {(editingCanvas.customerSegments || []).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-white/50 rounded px-2 py-1 text-sm">
                    <span className="truncate">{item}</span>
                    <button onClick={() => handleRemoveItem('customerSegments', idx)} className="text-gray-400 hover:text-red-500 ml-1">✕</button>
                  </div>
                ))}
                {activeCell === 'customerSegments' ? (
                  <div className="flex gap-1">
                    <input
                      type="text"
                      value={cellInput}
                      onChange={(e) => setCellInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddItem('customerSegments')}
                      placeholder="输入..."
                      className="flex-1 bg-white border border-gray-200 rounded px-2 py-1 text-sm"
                      autoFocus
                    />
                    <button onClick={() => handleAddItem('customerSegments')} className="text-blue-600">✓</button>
                    <button onClick={() => { setActiveCell(null); setCellInput(''); }} className="text-gray-400">✕</button>
                  </div>
                ) : (
                  <button onClick={() => setActiveCell('customerSegments')} className="text-sm text-gray-500 hover:text-gray-700">+ 添加</button>
                )}
              </div>
            </div>
            <div className="row-span-2 bg-teal-50 border border-teal-200 rounded-xl p-4">
              <h5 className="font-medium text-gray-800">渠道通路</h5>
              <p className="text-xs text-gray-500 mb-2">怎么卖？</p>
              <div className="space-y-2">
                {(editingCanvas.channels || []).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-white/50 rounded px-2 py-1 text-sm">
                    <span className="truncate">{item}</span>
                    <button onClick={() => handleRemoveItem('channels', idx)} className="text-gray-400 hover:text-red-500 ml-1">✕</button>
                  </div>
                ))}
                {activeCell === 'channels' ? (
                  <div className="flex gap-1">
                    <input
                      type="text"
                      value={cellInput}
                      onChange={(e) => setCellInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddItem('channels')}
                      placeholder="输入..."
                      className="flex-1 bg-white border border-gray-200 rounded px-2 py-1 text-sm"
                      autoFocus
                    />
                    <button onClick={() => handleAddItem('channels')} className="text-blue-600">✓</button>
                    <button onClick={() => { setActiveCell(null); setCellInput(''); }} className="text-gray-400">✕</button>
                  </div>
                ) : (
                  <button onClick={() => setActiveCell('channels')} className="text-sm text-gray-500 hover:text-gray-700">+ 添加</button>
                )}
              </div>
            </div>
          </div>

          {/* 下部3格 */}
          <div className="grid grid-cols-3 gap-4">
            {CANVAS_CELLS.slice(7).map((cell) => (
              <div key={cell.key} className={`${cell.color} border rounded-xl p-4`}>
                <h5 className="font-medium text-gray-800">{cell.title}</h5>
                <p className="text-xs text-gray-500 mb-2">{cell.subtitle}</p>
                <div className="space-y-2">
                  {(editingCanvas[cell.key as keyof BusinessCanvasData] || []).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white/50 rounded px-2 py-1 text-sm">
                      <span className="truncate">{item}</span>
                      <button onClick={() => handleRemoveItem(cell.key, idx)} className="text-gray-400 hover:text-red-500 ml-1">✕</button>
                    </div>
                  ))}
                  {activeCell === cell.key ? (
                    <div className="flex gap-1">
                      <input
                        type="text"
                        value={cellInput}
                        onChange={(e) => setCellInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddItem(cell.key)}
                        placeholder="输入..."
                        className="flex-1 bg-white border border-gray-200 rounded px-2 py-1 text-sm"
                        autoFocus
                      />
                      <button onClick={() => handleAddItem(cell.key)} className="text-blue-600">✓</button>
                      <button onClick={() => { setActiveCell(null); setCellInput(''); }} className="text-gray-400">✕</button>
                    </div>
                  ) : (
                    <button onClick={() => setActiveCell(cell.key)} className="text-sm text-gray-500 hover:text-gray-700">+ 添加</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <Button onClick={() => setEditingCanvas(currentCanvas!.data as BusinessCanvasData)}>编辑商业画布</Button>
        </div>
      )}
    </div>
  )
}
