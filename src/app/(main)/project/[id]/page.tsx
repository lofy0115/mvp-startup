'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Users,
  Lightbulb,
  Target,
  Rocket,
  ChevronLeft,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import {
  ComplaintCollection,
  ClusteringAnalysis,
  PainPointExtraction,
  UserPersona,
} from '@/components/phase1'
import {
  AssumptionBuilding,
  LeanCanvas,
} from '@/components/phase2'
import {
  ValueProposition,
  BusinessCanvas,
} from '@/components/phase3'
import {
  MVPDesign,
  TaskBoard,
} from '@/components/phase4'

const phases = [
  { id: 1, name: '理解用户', icon: Users, color: 'blue' },
  { id: 2, name: '验证机会', icon: Lightbulb, color: 'green' },
  { id: 3, name: '设计商业', icon: Target, color: 'purple' },
  { id: 4, name: '落地执行', icon: Rocket, color: 'orange' },
]

export default function ProjectPage() {
  const router = useRouter()
  const params = useParams()
  const { user, setPhase1Data, phase1Data } = useAppStore()
  const [project, setProject] = useState<{ id: string; name: string; phase: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [assumptions, setAssumptions] = useState<unknown[]>([])
  const [canvas, setCanvas] = useState<unknown[]>([])
  const [valuePropositions, setValuePropositions] = useState<unknown[]>([])
  const [businessCanvas, setBusinessCanvas] = useState<unknown[]>([])
  const [mvps, setMvps] = useState<unknown[]>([])
  const [selectedMvp, setSelectedMvp] = useState<{ id: string; name: string } | null>(null)
  const [tasks, setTasks] = useState<unknown[]>([])

  const projectId = params.id as string

  const fetchProject = useCallback(async () => {
    const res = await fetch(`/api/project/${projectId}`)
    if (!res.ok) throw new Error('Failed to fetch project')
    const data = await res.json()
    setProject(data.project)
    setPhase1Data({
      complaints: data.project.complaints || [],
      clusters: data.project.clusters?.map((c: { id: string; complaintIds: string[] }) => ({
        ...c,
        complaintIds: c.complaintIds || [],
      })) || [],
      painPoints: data.project.painPoints || [],
      personas: data.project.personas || [],
    })
  }, [projectId, setPhase1Data])

  const fetchAssumptions = useCallback(async () => {
    try {
      const res = await fetch(`/api/assumptions?projectId=${projectId}`)
      const data = await res.json()
      setAssumptions(data.assumptions || [])
    } catch (err) {
      console.error('Failed to fetch assumptions:', err)
    }
  }, [projectId])

  const fetchCanvas = useCallback(async () => {
    try {
      const res = await fetch(`/api/canvas?projectId=${projectId}&type=lean`)
      const data = await res.json()
      setCanvas(data.canvas || [])
    } catch (err) {
      console.error('Failed to fetch canvas:', err)
    }
  }, [projectId])

  const fetchValuePropositions = useCallback(async () => {
    try {
      const res = await fetch(`/api/value-propositions?projectId=${projectId}`)
      const data = await res.json()
      setValuePropositions(data.valuePropositions || [])
    } catch (err) {
      console.error('Failed to fetch value propositions:', err)
    }
  }, [projectId])

  const fetchBusinessCanvas = useCallback(async () => {
    try {
      const res = await fetch(`/api/business-canvas?projectId=${projectId}`)
      const data = await res.json()
      setBusinessCanvas(data.canvas || [])
    } catch (err) {
      console.error('Failed to fetch business canvas:', err)
    }
  }, [projectId])

  const fetchMvps = useCallback(async () => {
    try {
      const res = await fetch(`/api/mvp?projectId=${projectId}`)
      const data = await res.json()
      setMvps(data.mvps || [])
    } catch (err) {
      console.error('Failed to fetch MVPs:', err)
    }
  }, [projectId])

  const fetchTasks = useCallback(async (mvpId: string) => {
    try {
      const res = await fetch(`/api/tasks?mvpId=${mvpId}`)
      const data = await res.json()
      setTasks(data.tasks || [])
    } catch (err) {
      console.error('Failed to fetch tasks:', err)
    }
  }, [])

  const [activePhase, setActivePhase] = useState(1)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    setIsLoading(true)
    fetchProject()
      .catch((err) => console.error('Failed to fetch project:', err))
      .finally(() => setIsLoading(false))
  }, [user, projectId, router, fetchProject])

  useEffect(() => {
    if (activePhase === 2) {
      fetchAssumptions()
      fetchCanvas()
    }
  }, [activePhase, fetchAssumptions, fetchCanvas])

  useEffect(() => {
    if (activePhase === 3) {
      fetchValuePropositions()
      fetchBusinessCanvas()
    }
  }, [activePhase, fetchValuePropositions, fetchBusinessCanvas])

  useEffect(() => {
    if (activePhase === 4) {
      fetchMvps()
    }
  }, [activePhase, fetchMvps])

  const handlePhaseComplete = async () => {
    if (activePhase < 4) {
      try {
        await fetch(`/api/project/${projectId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phase: activePhase + 1 }),
        })
        setActivePhase(activePhase + 1)
        setProject((prev) => prev ? { ...prev, phase: activePhase + 1 } : null)
      } catch (err) {
        console.error('Failed to update phase:', err)
      }
    }
  }

  const canProceedToNextPhase = () => {
    switch (activePhase) {
      case 1:
        return phase1Data.complaints.length > 0 && phase1Data.personas.length > 0
      case 2:
        return assumptions.length > 0
      case 3:
        return true
      default:
        return false
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-gray-500">加载中...</div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-gray-500">项目不存在</div>
      </div>
    )
  }

  const personas = phase1Data.personas.map((p: { id: string; name: string; demographics: string; behaviors: string; description?: string | null }) => ({
    id: p.id,
    name: p.name,
    demographics: p.demographics,
    behaviors: p.behaviors,
    description: p.description,
  }))

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 border-r border-gray-200 bg-white flex flex-col">
        <div className="flex h-16 items-center border-b border-gray-200 px-4">
          <Link href="/dashboard" className="flex items-center text-sm text-gray-600 hover:text-gray-900">
            <ChevronLeft className="mr-1 h-4 w-4" />
            返回
          </Link>
          <span className="ml-4 font-medium text-gray-900 truncate">{project.name}</span>
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-1">
            {phases.map((phase) => {
              const Icon = phase.icon
              const isActive = activePhase === phase.id
              const isCompleted = project.phase > phase.id

              return (
                <button
                  key={phase.id}
                  onClick={() => setActivePhase(phase.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : isCompleted
                      ? 'text-gray-600 hover:bg-gray-50'
                      : 'text-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      isActive
                        ? 'bg-blue-100 text-blue-600'
                        : isCompleted
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {isCompleted ? (
                      <Sparkles className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>
                  <span>{phase.name}</span>
                </button>
              )
            })}
          </div>
        </nav>

        <div className="p-4">
          <div className="rounded-lg bg-gray-100 p-3">
            <div className="text-xs text-gray-500 mb-2">完成进度</div>
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((p) => (
                <div
                  key={p}
                  className={`h-2 flex-1 rounded-full ${
                    p <= project.phase ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{phases[activePhase - 1].name}</h1>
                <p className="mt-1 text-gray-600">
                  {activePhase === 1 && '从客户抱怨中提炼洞察，构建精准用户画像'}
                  {activePhase === 2 && '建立商业假设，用精益画布验证机会'}
                  {activePhase === 3 && '设计价值主张和商业模式'}
                  {activePhase === 4 && '定义MVP，快速落地执行'}
                </p>
              </div>
              {activePhase < 4 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    {activePhase === 1 && `${phase1Data.complaints.length} 条抱怨 · ${phase1Data.personas.length} 个画像`}
                    {activePhase === 2 && `${assumptions.length} 个假设 · ${canvas.length} 个画布`}
                    {activePhase === 3 && `${valuePropositions.length} 个价值主张 · ${businessCanvas.length} 个商业画布`}
                    {activePhase === 4 && `${mvps.length} 个MVP`}
                  </span>
                  <Button
                    size="sm"
                    onClick={handlePhaseComplete}
                    disabled={!canProceedToNextPhase()}
                  >
                    完成 Phase {activePhase}
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {activePhase === 1 && (
            <div className="grid gap-6 lg:grid-cols-2">
              <ComplaintCollection projectId={projectId} />
              <ClusteringAnalysis projectId={projectId} />
              <PainPointExtraction projectId={projectId} />
              <UserPersona projectId={projectId} />
            </div>
          )}

          {activePhase === 2 && (
            <div className="space-y-8">
              <AssumptionBuilding
                projectId={projectId}
                personas={personas}
                assumptions={assumptions as { id: string; personaId: string; type: string; content: string; validationMethod?: string | null; validationStatus: string; evidence?: string | null; priority: number }[]}
                onAssumptionsChange={fetchAssumptions}
              />
              <LeanCanvas
                projectId={projectId}
                personas={personas}
                canvas={canvas as { id: string; personaId: string; type: string; data: unknown; completeness: number }[]}
                onCanvasChange={fetchCanvas}
              />
            </div>
          )}

          {activePhase === 3 && (
            <div className="space-y-8">
              <ValueProposition
                projectId={projectId}
                personas={personas}
                painPoints={phase1Data.painPoints as { id: string; name: string; description?: string | null; compositeScore: number }[]}
                valueProposition={valuePropositions[0] as { id: string; personaId: string; jobs: string[]; pains: string[]; gains: string[]; painRelievers: string[]; gainsCreators: string[]; statement?: string | null } | undefined}
                onValuePropositionChange={fetchValuePropositions}
              />
              <BusinessCanvas
                projectId={projectId}
                personas={personas}
                businessCanvas={businessCanvas as { id: string; personaId: string; type: string; data: unknown; completeness: number }[]}
                onBusinessCanvasChange={fetchBusinessCanvas}
              />
            </div>
          )}

          {activePhase === 4 && (
            <div className="space-y-8">
              <MVPDesign
                projectId={projectId}
                mvps={mvps as { id: string; name: string; description?: string | null; type: string; cost?: number | null; timeline?: string | null; features: unknown[]; status: string }[]}
                onMVPsChange={fetchMvps}
                onSelectMvp={(mvp) => {
                  setSelectedMvp(mvp)
                  if (mvp) fetchTasks(mvp.id)
                  else setTasks([])
                }}
                selectedMvpId={selectedMvp?.id}
              />
              {selectedMvp && (
                <TaskBoard
                  mvpId={selectedMvp.id}
                  mvpName={selectedMvp.name}
                  tasks={tasks as { id: string; mvpId: string; name: string; description?: string | null; owner?: string | null; status: string; priority: number; dependencies: string[]; dueDate?: string | null }[]}
                  onTasksChange={() => fetchTasks(selectedMvp.id)}
                />
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
