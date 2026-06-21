'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface Task {
  id: string
  mvpId: string
  name: string
  description?: string | null
  owner?: string | null
  status: string
  priority: number
  dependencies: string[]
  dueDate?: string | null
}

interface MVP {
  id: string
  name: string
}

interface TaskBoardProps {
  mvpId: string
  mvpName: string
  tasks?: Task[]
  onTasksChange?: () => void
}

const STATUS_COLUMNS = [
  { key: 'todo', label: '待办', color: 'bg-gray-100 border-gray-300' },
  { key: 'in_progress', label: '进行中', color: 'bg-blue-100 border-blue-300' },
  { key: 'done', label: '已完成', color: 'bg-green-100 border-green-300' },
]

const PRIORITY_LABELS = ['', 'P0', 'P1', 'P2', 'P3', 'P4']

export function TaskBoard({
  mvpId,
  mvpName,
  tasks: initialTasks = [],
  onTasksChange,
}: TaskBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    owner: '',
    priority: 3,
    dueDate: '',
  })

  const handleCreate = async () => {
    if (!formData.name.trim()) return

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mvpId,
          name: formData.name,
          description: formData.description || undefined,
          owner: formData.owner || undefined,
          priority: formData.priority,
          dueDate: formData.dueDate || undefined,
        }),
      })
      const data = await res.json()
      if (data.task) {
        setTasks([...tasks, data.task])
        setFormData({ name: '', description: '', owner: '', priority: 3, dueDate: '' })
        setShowAddForm(false)
        onTasksChange?.()
      }
    } catch (err) {
      console.error('Failed to create task:', err)
    }
  }

  const handleUpdateStatus = async (taskId: string, status: string) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, status }),
      })
      const data = await res.json()
      if (data.task) {
        setTasks(tasks.map((t) => (t.id === taskId ? data.task : t)))
        onTasksChange?.()
      }
    } catch (err) {
      console.error('Failed to update task:', err)
    }
  }

  const handleDelete = async (taskId: string) => {
    try {
      await fetch(`/api/tasks?id=${taskId}`, { method: 'DELETE' })
      setTasks(tasks.filter((t) => t.id !== taskId))
      onTasksChange?.()
    } catch (err) {
      console.error('Failed to delete task:', err)
    }
  }

  const getTasksByStatus = (status: string) => {
    return tasks.filter((t) => t.status === status)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">落地步骤</h3>
          <p className="text-sm text-gray-500 mt-1">
            {mvpName} - 任务看板
          </p>
        </div>
        <Button size="sm" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? '取消' : '+ 添加任务'}
        </Button>
      </div>

      {/* 添加任务表单 */}
      {showAddForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">任务名称</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="如：完成原型设计"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">负责人</label>
              <input
                type="text"
                value={formData.owner}
                onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                placeholder="如：你/团队成员"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">优先级</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="1">P0 - 紧急</option>
                <option value="2">P1 - 高</option>
                <option value="3">P2 - 中</option>
                <option value="4">P3 - 低</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">截止日期</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="任务详细描述..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              rows={2}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowAddForm(false)}>取消</Button>
            <Button size="sm" onClick={handleCreate}>添加</Button>
          </div>
        </div>
      )}

      {/* 看板 */}
      <div className="grid grid-cols-3 gap-4">
        {STATUS_COLUMNS.map((column) => {
          const columnTasks = getTasksByStatus(column.key)
          return (
            <div key={column.key} className="space-y-2">
              <div className={`rounded-lg border-2 ${column.color} px-3 py-2`}>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">{column.label}</span>
                  <span className="text-sm text-gray-500">{columnTasks.length}</span>
                </div>
              </div>
              <div className="space-y-2 min-h-[200px]">
                {columnTasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <span className="font-medium text-gray-900 text-sm">{task.name}</span>
                      <span className="text-xs text-gray-400">{PRIORITY_LABELS[task.priority]}</span>
                    </div>
                    {task.description && (
                      <p className="text-xs text-gray-500 mb-2 line-clamp-2">{task.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      {task.owner && (
                        <span className="text-xs text-gray-400">👤 {task.owner}</span>
                      )}
                      {task.dueDate && (
                        <span className="text-xs text-gray-400">📅 {new Date(task.dueDate).toLocaleDateString()}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                      <select
                        value={task.status}
                        onChange={(e) => handleUpdateStatus(task.id, e.target.value)}
                        className="text-xs border border-gray-200 rounded px-1 py-0.5"
                      >
                        <option value="todo">待办</option>
                        <option value="in_progress">进行中</option>
                        <option value="done">完成</option>
                      </select>
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="text-xs text-gray-400 hover:text-red-500"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {tasks.length === 0 && !showAddForm && (
        <div className="text-center py-8 text-gray-500">
          <p>还没有任务</p>
          <p className="text-sm mt-1">点击&quot;添加任务&quot;开始规划</p>
        </div>
      )}
    </div>
  )
}
