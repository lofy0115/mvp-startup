'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { MessageSquare, Trash2, Upload, X } from 'lucide-react'

interface ComplaintCollectionProps {
  projectId: string
}

const SOURCE_OPTIONS = [
  { value: 'interview', label: '访谈' },
  { value: 'survey', label: '问卷' },
  { value: 'support', label: '售后' },
  { value: 'social', label: '社媒' },
  { value: 'review', label: '评论' },
]

function cleanText(text: string): string {
  return text
    .replace(/\[.*?\]/g, '')
    .replace(/\(.*?\)/g, '')
    .replace(/<.*?>/g, '')
    .replace(/[#*_~`]/g, '')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function ComplaintCollection({ projectId }: ComplaintCollectionProps) {
  const { phase1Data, addComplaints, removeComplaint } = useAppStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [bulkText, setBulkText] = useState('')
  const [source, setSource] = useState('interview')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const complaints = phase1Data.complaints

  const sourceStats = SOURCE_OPTIONS.reduce((acc, opt) => {
    acc[opt.value] = complaints.filter((c) => c.source === opt.value).length
    return acc
  }, {} as Record<string, number>)

  const handleBulkSubmit = async () => {
    const lines = bulkText.split('\n').filter((line) => line.trim())
    if (lines.length === 0) return

    setIsSubmitting(true)
    try {
      const cleanedComplaints = lines.map((line) => ({
        rawText: line.trim(),
        cleanedText: cleanText(line),
        source,
      }))

      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, complaints: cleanedComplaints }),
      })

      if (!res.ok) throw new Error('Failed to create complaints')

      const data = await res.json()
      addComplaints(data.complaints)
      setBulkText('')
      setIsModalOpen(false)
    } catch (error) {
      console.error('Failed to submit complaints:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/complaints?id=${id}`, { method: 'DELETE' })
      removeComplaint(id)
    } catch (error) {
      console.error('Failed to delete complaint:', error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <CardTitle>抱怨收集</CardTitle>
          </div>
          <Button size="sm" onClick={() => setIsModalOpen(true)}>
            <Upload className="h-4 w-4 mr-1" />
            批量导入
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {complaints.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-2 text-gray-500">暂无抱怨数据</p>
            <p className="text-xs text-gray-400 mt-1">批量粘贴文本，每行一条</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-5 gap-2 p-3 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{complaints.length}</div>
                <div className="text-xs text-gray-500">总抱怨数</div>
              </div>
              {SOURCE_OPTIONS.slice(0, 4).map((opt) => (
                <div key={opt.value} className="text-center">
                  <div className="text-lg font-semibold text-gray-700">{sourceStats[opt.value] || 0}</div>
                  <div className="text-xs text-gray-500">{opt.label}</div>
                </div>
              ))}
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2">
              {complaints.slice(0, 20).map((c) => (
                <div
                  key={c.id}
                  className="group relative rounded-lg border p-3 pr-8 hover:bg-gray-50"
                >
                  <div className="text-sm text-gray-800">{c.rawText}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 bg-gray-100 rounded">
                      {SOURCE_OPTIONS.find((o) => o.value === c.source)?.label || c.source}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {complaints.length > 20 && (
              <div className="text-center text-sm text-gray-500">
                还有 {complaints.length - 20} 条抱怨未显示
              </div>
            )}
          </div>
        )}
      </CardContent>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">批量导入抱怨</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">数据来源</label>
                <div className="flex gap-2">
                  {SOURCE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSource(opt.value)}
                      className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                        source === opt.value
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  粘贴抱怨文本（每行一条）
                </label>
                <textarea
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder="APP经常崩溃，很失望&#10;客服响应太慢，等了2小时&#10;价格太贵，不如竞争对手..."
                  className="w-full h-48 p-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {bulkText && (
                <div className="text-sm text-gray-500">
                  共 {bulkText.split('\n').filter((l) => l.trim()).length} 条抱怨
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                取消
              </Button>
              <Button onClick={handleBulkSubmit} disabled={!bulkText.trim() || isSubmitting}>
                {isSubmitting ? '导入中...' : '确认导入'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}