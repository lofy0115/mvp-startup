'use client'

import Link from 'next/link'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { LogOut, FolderKanban, Plus } from 'lucide-react'

export function Navbar() {
  const { user, currentProject, logout, setCurrentProject } = useAppStore()

  if (!user) return null

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                <span className="text-sm font-bold text-white">MV</span>
              </div>
              <span className="font-semibold text-gray-900">MVP工具</span>
            </Link>
            {currentProject && (
              <div className="flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5">
                <FolderKanban className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">{currentProject.name}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {currentProject && (
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  <Plus className="mr-1 h-4 w-4" />
                  新建项目
                </Button>
              </Link>
            )}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{user.email}</span>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
