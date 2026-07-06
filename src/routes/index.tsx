import { createFileRoute } from '@tanstack/react-router'
import { LoginCard } from '@/components/auth/LoginCard'

export const Route = createFileRoute('/')({
  component: Landing,
})

function Landing() {
  return (
    <main className="relative z-10 flex min-h-svh items-center justify-center p-6">
      <LoginCard />
    </main>
  )
}
