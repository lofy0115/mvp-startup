'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Plus, FolderKanban, ArrowRight } from 'lucide-react'

interface Project {
  id: string
  name: string
  phase: number
  createdAt: string
  _count: {
    complaints: number
    personas: number
    canvas: number
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, setCurrentProject } = useAppStore()
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    fetchProjects()
  }, [user, router])

  const fetchProjects = async () => {
    try {
      const res = await fetch(`/api/projects?userId=${user?.id}`)
      const data = await res.json()
      setProjects(data.projects || [])
    } catch (err) {
      console.error('Failed to fetch projects:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const createProject = async () => {
    if (!newProjectName.trim() || !user) return

    setIsCreating(true)
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, name: newProjectName }),
      })
      const data = await res.json()

      if (data.project) {
        setNewProjectName('')
        setCurrentProject(data.project)
        router.push(`/project/${data.project.id}`)
      }
    } catch (err) {
      console.error('Failed to create project:', err)
    } finally {
      setIsCreating(false)
    }
  }

  const phaseNames = ['', '理解用户', '验证机会', '设计商业', '落地执行']

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
                <span className="text-sm font-bold text-white">MV</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">MVP创业工具</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">{user.email}</span>
              <Button variant="ghost" size="sm" onClick={() => useAppStore.getState().logout()}>
                退出
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">我的项目</h1>
            <p className="mt-1 text-sm text-gray-600">管理你的创业项目</p>
          </div>
        </div>

        {/* Create Project Card */}
        <Card className="mb-8 border-dashed border-2 border-gray-300 bg-gray-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="输入新项目名称..."
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && createProject()}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <Button onClick={createProject} disabled={!newProjectName.trim() || isCreating}>
                <Plus className="mr-1 h-4 w-4" />
                {isCreating ? '创建中...' : '创建项目'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">加载中...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <FolderKanban className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">暂无项目</h3>
            <p className="mt-2 text-sm text-gray-500">创建你的第一个创业项目，开始验证之旅</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card key={project.id} className="hover:border-blue-300 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <CardDescription>
                        阶段 {project.phase} · {phaseNames[project.phase]}
                      </CardDescription>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                      <FolderKanban className="h-4 w-4 text-gray-500" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <span>{project._count.complaints} 条抱怨</span>
                    <span>{project._count.personas} 个画像</span>
                    <span>{project._count.canvas} 张画布</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {new Date(project.createdAt).toLocaleDateString('zh-CN')}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setCurrentProject(project)
                        router.push(`/project/${project.id}`)
                      }}
                    >
                      打开
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
