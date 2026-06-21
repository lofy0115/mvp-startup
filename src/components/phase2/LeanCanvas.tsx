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

interface CanvasData {
  problem: string[]
  solution: string[]
  uniqueValue: string
  unfairAdvantage: string[]
  channels: string[]
  customerSegments: string[]
  costStructure: string[]
  revenueStreams: string[]
  keyMetrics: string[]
}

interface Canvas {
  id: string
  personaId: string
  type: string
  data: CanvasData | unknown
  completeness: number
  persona?: Persona
}

interface LeanCanvasProps {
  projectId: string
  personas: Persona[]
  canvas?: Canvas[]
  onCanvasChange?: () => void
}

const CANVAS_CELLS = [
  {
    key: 'problem',
    title: '问题',
    color: 'bg-red-50 border-red-200',
    placeholder: '列出Top 3问题...',
  },
  {
    key: 'solution',
    title: '解决方案',
    color: 'bg-blue-50 border-blue-200',
    placeholder: '列出Top 3解决方案...',
  },
  {
    key: 'uniqueValue',
    title: '独特价值主张',
    color: 'bg-purple-50 border-purple-200',
    placeholder: '为什么你与众不同...',
    fullWidth: true,
  },
  {
    key: 'unfairAdvantage',
    title: '门槛优势',
    color: 'bg-orange-50 border-orange-200',
    placeholder: '什么让你难以被复制...',
  },
  {
    key: 'channels',
    title: '渠道',
    color: 'bg-green-50 border-green-200',
    placeholder: '如何触达客户...',
  },
  {
    key: 'customerSegments',
    title: '客户细分',
    color: 'bg-gray-50 border-gray-200',
    placeholder: '你的目标客户是谁...',
  },
  {
    key: 'keyMetrics',
    title: '关键指标',
    color: 'bg-teal-50 border-teal-200',
    placeholder: '如何衡量进展...',
  },
  {
    key: 'costStructure',
    title: '成本结构',
    color: 'bg-yellow-50 border-yellow-200',
    placeholder: '启动需要多少钱...',
  },
  {
    key: 'revenueStreams',
    title: '收入来源',
    color: 'bg-emerald-50 border-emerald-200',
    placeholder: '用户愿意付多少...',
  },
]

export function LeanCanvas({
  projectId,
  personas,
  canvas: initialCanvas = [],
  onCanvasChange,
}: LeanCanvasProps) {
  const [canvasList, setCanvasList] = useState<Canvas[]>(initialCanvas)
  const [selectedPersona, setSelectedPersona] = useState<string>(personas[0]?.id || '')
  const [editingCanvas, setEditingCanvas] = useState<CanvasData | null>(null)
  const [activeCell, setActiveCell] = useState<string | null>(null)
  const [cellInput, setCellInput] = useState('')

  const currentCanvas = canvasList.find((c) => c.personaId === selectedPersona && c.type === 'lean')

  const handleCreateCanvas = async () => {
    try {
      const res = await fetch('/api/canvas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personaId: selectedPersona,
          projectId,
          type: 'lean',
          data: {
            problem: [],
            solution: [],
            uniqueValue: '',
            unfairAdvantage: [],
            channels: [],
            customerSegments: [],
            costStructure: [],
            revenueStreams: [],
            keyMetrics: [],
          },
        }),
      })
      const data = await res.json()
      if (data.canvas) {
        setCanvasList([...canvasList, data.canvas])
        setEditingCanvas(data.canvas.data as CanvasData)
        onCanvasChange?.()
      }
    } catch (err) {
      console.error('Failed to create canvas:', err)
    }
  }

  const handleUpdateCell = async (key: string, value: string[] | string) => {
    if (!currentCanvas || !editingCanvas) return

    const newData = { ...editingCanvas, [key]: value } as CanvasData

    try {
      const res = await fetch('/api/canvas', {
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
        onCanvasChange?.()
      }
    } catch (err) {
      console.error('Failed to update canvas:', err)
    }
  }

  const handleAddItem = (key: string) => {
    if (!cellInput.trim() || !editingCanvas) return

    const currentValue = editingCanvas[key as keyof CanvasData] as string[]
    handleUpdateCell(key, [...currentValue, cellInput.trim()])
    setCellInput('')
    setActiveCell(null)
  }

  const handleRemoveItem = (key: string, index: number) => {
    if (!editingCanvas) return

    const currentValue = editingCanvas[key as keyof CanvasData] as string[]
    handleUpdateCell(key, currentValue.filter((_, i) => i !== index))
  }

  const initEditing = () => {
    if (currentCanvas) {
      setEditingCanvas(currentCanvas.data as CanvasData)
    } else {
      handleCreateCanvas()
    }
  }

  // 如果还没有编辑中的画布，初始化
  if (!editingCanvas && currentCanvas) {
    setEditingCanvas(currentCanvas.data as CanvasData)
  }

  const completeness = currentCanvas?.completeness || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">精益画布</h3>
          <p className="text-sm text-gray-500 mt-1">
            将商业模式简化到一页纸，验证核心假设
          </p>
        </div>
        <div className="flex items-center gap-4">
          {completeness > 0 && (
            <div className="text-sm">
              <span className="text-gray-500">完整度：</span>
              <span className="font-medium text-blue-600">{Math.round(completeness)}%</span>
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
                ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
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
          <div className="text-6xl mb-4">📋</div>
          <h4 className="text-lg font-medium text-gray-700 mb-2">还没有精益画布</h4>
          <p className="text-gray-500 mb-6">为这个用户画像创建一个精益画布</p>
          <Button onClick={handleCreateCanvas}>创建精益画布</Button>
        </div>
      ) : editingCanvas ? (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          {/* 顶部三格 */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            {CANVAS_CELLS.slice(0, 3).map((cell) => (
              <div
                key={cell.key}
                className={`${cell.color} border rounded-xl p-4 ${cell.fullWidth ? 'col-span-1' : ''}`}
              >
                <h5 className="font-medium text-gray-800 mb-2">{cell.title}</h5>
                {cell.key === 'uniqueValue' ? (
                  <div>
                    <textarea
                      value={editingCanvas.uniqueValue}
                      onChange={(e) => handleUpdateCell('uniqueValue', e.target.value)}
                      placeholder={cell.placeholder}
                      className="w-full bg-white/50 border border-gray-200 rounded-lg p-2 text-sm resize-none"
                      rows={3}
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {(editingCanvas[cell.key as keyof CanvasData] as string[]).map(
                      (item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between bg-white/50 rounded px-2 py-1 text-sm"
                        >
                          <span>{item}</span>
                          <button
                            onClick={() => handleRemoveItem(cell.key, idx)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            ✕
                          </button>
                        </div>
                      )
                    )}
                    {activeCell === cell.key ? (
                      <div className="flex gap-1">
                        <input
                          type="text"
                          value={cellInput}
                          onChange={(e) => setCellInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddItem(cell.key)}
                          placeholder="输入内容..."
                          className="flex-1 bg-white border border-gray-200 rounded px-2 py-1 text-sm"
                          autoFocus
                        />
                        <button
                          onClick={() => handleAddItem(cell.key)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => {
                            setActiveCell(null)
                            setCellInput('')
                          }}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setActiveCell(cell.key)}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        + 添加
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 中部三格 */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            {CANVAS_CELLS.slice(3, 6).map((cell) => (
              <div key={cell.key} className={`${cell.color} border rounded-xl p-4`}>
                <h5 className="font-medium text-gray-800 mb-2">{cell.title}</h5>
                <div className="space-y-2">
                  {(editingCanvas[cell.key as keyof CanvasData] as string[]).map(
                    (item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-white/50 rounded px-2 py-1 text-sm"
                      >
                        <span>{item}</span>
                        <button
                          onClick={() => handleRemoveItem(cell.key, idx)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          ✕
                        </button>
                      </div>
                    )
                  )}
                  {activeCell === cell.key ? (
                    <div className="flex gap-1">
                      <input
                        type="text"
                        value={cellInput}
                        onChange={(e) => setCellInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddItem(cell.key)}
                        placeholder="输入内容..."
                        className="flex-1 bg-white border border-gray-200 rounded px-2 py-1 text-sm"
                        autoFocus
                      />
                      <button
                        onClick={() => handleAddItem(cell.key)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => {
                          setActiveCell(null)
                          setCellInput('')
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setActiveCell(cell.key)}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      + 添加
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* 底部三格 */}
          <div className="grid grid-cols-3 gap-4">
            {CANVAS_CELLS.slice(6).map((cell) => (
              <div key={cell.key} className={`${cell.color} border rounded-xl p-4`}>
                <h5 className="font-medium text-gray-800 mb-2">{cell.title}</h5>
                <div className="space-y-2">
                  {(editingCanvas[cell.key as keyof CanvasData] as string[]).map(
                    (item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-white/50 rounded px-2 py-1 text-sm"
                      >
                        <span>{item}</span>
                        <button
                          onClick={() => handleRemoveItem(cell.key, idx)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          ✕
                        </button>
                      </div>
                    )
                  )}
                  {activeCell === cell.key ? (
                    <div className="flex gap-1">
                      <input
                        type="text"
                        value={cellInput}
                        onChange={(e) => setCellInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddItem(cell.key)}
                        placeholder="输入内容..."
                        className="flex-1 bg-white border border-gray-200 rounded px-2 py-1 text-sm"
                        autoFocus
                      />
                      <button
                        onClick={() => handleAddItem(cell.key)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => {
                          setActiveCell(null)
                          setCellInput('')
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setActiveCell(cell.key)}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      + 添加
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <Button onClick={initEditing}>编辑精益画布</Button>
        </div>
      )}
    </div>
  )
}
