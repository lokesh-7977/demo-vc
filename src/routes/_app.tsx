import { useEffect } from 'react'
import { Outlet, createFileRoute, useNavigate } from '@tanstack/react-router'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { useApp } from '@/stores/app-store'

export const Route = createFileRoute('/_app')({
  component: AppShell,
})

function AppShell() {
  const session = useApp((s) => s.session)
  const navigate = useNavigate()

  // fake auth guard — session lives only in memory
  useEffect(() => {
    if (!session) navigate({ to: '/' })
  }, [session, navigate])

  if (!session) return null

  return (
    <div className="relative z-10 flex h-svh overflow-hidden">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
