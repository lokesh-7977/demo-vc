import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { AudioLines, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Waveform } from '@/components/common/Waveform'
import { useLogin } from '@/features/auth/auth.queries'

export function LoginCard() {
  const navigate = useNavigate()
  const login = useLogin()

  const [loginForm, setLoginForm] = useState({ email: '', password: '' })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login.mutateAsync(loginForm)
      navigate({ to: '/dashboard' })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Login failed')
    }
  }

  return (
    <div className="w-full max-w-md space-y-8">
      {/* brand */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl border border-brand-blue/30 bg-linear-to-br from-brand-blue/20 to-brand-violet/20">
          <AudioLines className="text-brand-blue" size={22} />
        </div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-gradient">
          Lokvera
        </h1>
        <p className="mt-2 text-sm text-text-soft">
          AI voice agents + sales CRM for Indian businesses
        </p>
        <Waveform live bars={28} className="mx-auto mt-4 h-6 w-fit opacity-70" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-display">Welcome back</CardTitle>
          <CardDescription>Sign in to your organization.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@company.com"
                value={loginForm.email}
                onChange={(e) =>
                  setLoginForm((f) => ({ ...f, email: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">Password</Label>
              <Input
                id="login-password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={loginForm.password}
                onChange={(e) =>
                  setLoginForm((f) => ({ ...f, password: e.target.value }))
                }
              />
            </div>
            <Button type="submit" className="w-full" disabled={login.isPending}>
              {login.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Sign in
            </Button>
          </form>
          <p className="mt-4 text-center text-xs text-text-soft">
            Organizations are provisioned by your Lokvera administrator.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
