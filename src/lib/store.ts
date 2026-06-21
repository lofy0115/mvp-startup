import { create } from 'zustand'

interface User {
  id: string
  email: string
  name?: string
}

interface Project {
  id: string
  name: string
  phase: number
}

interface Complaint {
  id: string
  projectId: string
  rawText: string
  cleanedText: string | null
  source: string | null
  clusterId: string | null
  cluster?: Cluster | null
  createdAt: string
}

interface Cluster {
  id: string
  projectId: string
  name: string
  dimension: 'pain_point' | 'user_type' | 'scenario'
  type: 'system' | 'user'
  complaintIds: string[]
  count: number
  createdAt: string
}

interface PainPoint {
  id: string
  projectId: string
  clusterId: string | null
  cluster?: Cluster | null
  name: string
  description: string | null
  frequencyScore: number
  intensityScore: number
  paymentWillingness: number
  compositeScore: number
  rank: number
  createdAt: string
}

interface Persona {
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
    painPoint: PainPoint
  }>
}

interface Phase1Data {
  complaints: Complaint[]
  clusters: Cluster[]
  painPoints: PainPoint[]
  personas: Persona[]
}

interface AppState {
  user: User | null
  currentProject: Project | null
  phase1Data: Phase1Data
  isLoadingPhase1: boolean
  setUser: (user: User | null) => void
  setCurrentProject: (project: Project | null) => void
  setPhase1Data: (data: Phase1Data) => void
  setIsLoadingPhase1: (loading: boolean) => void
  addComplaints: (complaints: Complaint[]) => void
  removeComplaint: (id: string) => void
  addClusters: (clusters: Cluster[]) => void
  removeCluster: (id: string) => void
  updatePainPoint: (id: string, data: Partial<PainPoint>) => void
  addPainPoints: (painPoints: PainPoint[]) => void
  removePainPoint: (id: string) => void
  addPersonas: (personas: Persona[]) => void
  updatePersona: (id: string, data: Partial<Persona>) => void
  removePersona: (id: string) => void
  logout: () => void
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  currentProject: null,
  phase1Data: {
    complaints: [],
    clusters: [],
    painPoints: [],
    personas: [],
  },
  isLoadingPhase1: false,
  setUser: (user) => set({ user }),
  setCurrentProject: (project) => set({ currentProject: project }),
  setPhase1Data: (data) => set({ phase1Data: data }),
  setIsLoadingPhase1: (loading) => set({ isLoadingPhase1: loading }),
  addComplaints: (complaints) =>
    set((state) => ({
      phase1Data: {
        ...state.phase1Data,
        complaints: [...complaints, ...state.phase1Data.complaints],
      },
    })),
  removeComplaint: (id) =>
    set((state) => ({
      phase1Data: {
        ...state.phase1Data,
        complaints: state.phase1Data.complaints.filter((c) => c.id !== id),
      },
    })),
  addClusters: (clusters) =>
    set((state) => ({
      phase1Data: {
        ...state.phase1Data,
        clusters: [...clusters, ...state.phase1Data.clusters],
      },
    })),
  removeCluster: (id) =>
    set((state) => ({
      phase1Data: {
        ...state.phase1Data,
        clusters: state.phase1Data.clusters.filter((c) => c.id !== id),
      },
    })),
  updatePainPoint: (id, data) =>
    set((state) => ({
      phase1Data: {
        ...state.phase1Data,
        painPoints: state.phase1Data.painPoints.map((p) =>
          p.id === id ? { ...p, ...data } : p
        ),
      },
    })),
  addPainPoints: (painPoints) =>
    set((state) => ({
      phase1Data: {
        ...state.phase1Data,
        painPoints: [...state.phase1Data.painPoints, ...painPoints],
      },
    })),
  removePainPoint: (id) =>
    set((state) => ({
      phase1Data: {
        ...state.phase1Data,
        painPoints: state.phase1Data.painPoints.filter((p) => p.id !== id),
      },
    })),
  addPersonas: (personas) =>
    set((state) => ({
      phase1Data: {
        ...state.phase1Data,
        personas: [...personas, ...state.phase1Data.personas],
      },
    })),
  updatePersona: (id, data) =>
    set((state) => ({
      phase1Data: {
        ...state.phase1Data,
        personas: state.phase1Data.personas.map((p) =>
          p.id === id ? { ...p, ...data } : p
        ),
      },
    })),
  removePersona: (id) =>
    set((state) => ({
      phase1Data: {
        ...state.phase1Data,
        personas: state.phase1Data.personas.filter((p) => p.id !== id),
      },
    })),
  logout: () =>
    set({
      user: null,
      currentProject: null,
      phase1Data: { complaints: [], clusters: [], painPoints: [], personas: [] },
    }),
}))