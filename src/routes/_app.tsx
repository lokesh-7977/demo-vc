import { useEffect } from 'react'
import { Outlet, createFileRoute, useNavigate } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { useAuth } from '@/stores/auth-store'
import { restoreSession } from '@/lib/api'

export const Route = createFileRoute('/_app')({
  component: AppShell,
})

function AppShell() {
  const user = useAuth((s) => s.user)
  const isRestoring = useAuth((s) => s.isRestoring)
  const setRestoring = useAuth((s) => s.setRestoring)
  const navigate = useNavigate()

  useEffect(() => {
    // Already authenticated (e.g. after login) — skip restore.
    if (useAuth.getState().user && useAuth.getState().accessToken) {
      setRestoring(false)
      return
    }

    let active = true
    restoreSession().then((ok) => {
      if (!active) return
      setRestoring(false)
      if (!ok) navigate({ to: '/' })
    })
    return () => { active = false }
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (isRestoring) {
    return (
      <div className="flex h-svh items-center justify-center">
        <Loader2 className="animate-spin text-text-faint" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="relative z-10 flex h-svh overflow-hidden">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  )
}
