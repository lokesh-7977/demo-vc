import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ArrowRight, AudioLines, Building2, LogIn } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StatusPill } from '@/components/common/StatusPill'
import { Waveform } from '@/components/common/Waveform'
import { useApp } from '@/stores/app-store'
import { initials } from '@/lib/format'

/* Fake auth: both tabs resolve to picking a user from data.json and
   setting them as the in-memory session. */
export function LoginCard() {
  const [orgName, setOrgName] = useState('')
  const users = useApp((s) => s.users)
  const login = useApp((s) => s.login)
  const navigate = useNavigate()

  const enter = (userId: string) => {
    login(userId)
    navigate({ to: '/dashboard' })
  }

  const userList = (label: string) => (
    <div className="space-y-3">
      <p className="eyebrow">{label}</p>
      <ul className="space-y-2">
        {users.map((u) => (
          <li key={u.id}>
            <button
              onClick={() => enter(u.id)}
              className="glass-hover group flex w-full items-center gap-3 rounded-xl border border-line px-4 py-3 text-left"
            >
              <Avatar className="size-9">
                <AvatarFallback className="bg-linear-to-br from-brand-blue/25 to-brand-violet/25 font-display text-sm text-text-strong">
                  {initials(u.name)}
                </AvatarFallback>
              </Avatar>
              <span className="flex-1">
                <span className="block text-sm font-medium text-text-strong">
                  {u.name}
                </span>
                <span className="block text-xs text-text-faint">{u.email}</span>
              </span>
              <StatusPill status={u.role}>
                {u.role === 'admin' ? 'Admin' : 'Sales Rep'}
              </StatusPill>
              <ArrowRight
                size={14}
                className="text-text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-brand-blue"
              />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )

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
          <CardTitle className="font-display">Welcome</CardTitle>
          <CardDescription>
            Demo build — pick a user, no password needed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login">
            <TabsList className="mb-4 grid w-full grid-cols-2">
              <TabsTrigger value="login" className="gap-2">
                <LogIn size={14} /> Login
              </TabsTrigger>
              <TabsTrigger value="create" className="gap-2">
                <Building2 size={14} /> Create Organization
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">{userList('Sign in as')}</TabsContent>

            <TabsContent value="create" className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="org-name">Organization name</Label>
                <Input
                  id="org-name"
                  placeholder="Acme Motors Pvt Ltd"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                />
                <p className="text-xs text-text-faint">
                  Creating an organization signs you in as a demo user below.
                </p>
              </div>
              {userList('Continue as')}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-text-faint">
        Frontend demo · all data is local, nothing is sent anywhere
      </p>
    </div>
  )
}
