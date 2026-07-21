import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Copy, Loader2, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DataTable } from '@/components/common/DataTable'
import { StatusPill } from '@/components/common/StatusPill'
import {
  useEmployeeInvitations,
  useEmployees,
  useInviteEmployee,
  useRoles,
  type Employee,
} from '@/lib/queries'

export function TeamView() {
  const { data: employees, isLoading } = useEmployees()
  const { data: roles } = useRoles()
  const { data: invitations } = useEmployeeInvitations()
  const invite = useInviteEmployee()

  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ email: '', roleId: '' })
  const [inviteUrl, setInviteUrl] = useState<string | null>(null)

  const columns = useMemo<ColumnDef<Employee>[]>(
    () => [
      {
        header: 'Name',
        accessorFn: (u) => `${u.firstName} ${u.lastName}`,
        cell: ({ getValue }) => (
          <span className="font-medium text-text-strong">{getValue<string>()}</span>
        ),
      },
      { header: 'Email', accessorKey: 'email' },
      {
        header: 'Role',
        accessorFn: (u) => u.role ?? '—',
        cell: ({ getValue }) => (
          <StatusPill status={getValue<string>()}>{getValue<string>()}</StatusPill>
        ),
      },
      {
        header: 'Status',
        accessorFn: (u) => (u.isActive ? 'active' : 'disabled'),
        cell: ({ getValue }) => (
          <StatusPill status={getValue<string>()}>{getValue<string>()}</StatusPill>
        ),
      },
    ],
    [],
  )

  const sendInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const result = await invite.mutateAsync(form)
      setInviteUrl(result.inviteUrl)
      toast.success(result.emailSent ? 'Invitation sent' : 'Invitation created')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Invite failed')
    }
  }

  const pending = (invitations ?? []).filter((i) => i.status === 'PENDING')

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle className="font-display text-base">Team members</CardTitle>
            <CardDescription>
              Seats are limited by your plan — Basic includes 3 users.
            </CardDescription>
          </div>
          <Button size="sm" onClick={() => { setInviteUrl(null); setOpen(true) }}>
            <UserPlus size={14} className="mr-1" /> Invite member
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-text-faint" />
            </div>
          ) : (
            <DataTable columns={columns} data={employees ?? []} />
          )}
        </CardContent>
      </Card>

      {pending.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-base">Pending invitations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {pending.map((i) => (
              <div
                key={i.id}
                className="flex items-center justify-between rounded-lg border border-line px-3 py-2 text-sm"
              >
                <span className="text-text-strong">{i.email}</span>
                <span className="text-xs text-text-faint">
                  expires {new Date(i.expiresAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Invite a team member</DialogTitle>
            <DialogDescription>
              They'll get an email link to set their password and join.
            </DialogDescription>
          </DialogHeader>

          {inviteUrl ? (
            <div className="space-y-3">
              <p className="text-sm text-text-soft">
                Invitation ready. Share this link if the email doesn't arrive:
              </p>
              <div className="flex items-center gap-2">
                <Input readOnly value={inviteUrl} className="font-mono text-xs" />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    navigator.clipboard.writeText(inviteUrl)
                    toast.success('Copied')
                  }}
                >
                  <Copy size={14} />
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={sendInvite} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input
                  type="email"
                  required
                  placeholder="teammate@company.com"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Role</Label>
                <Select
                  value={form.roleId}
                  onValueChange={(v) => setForm((f) => ({ ...f, roleId: v }))}
                >
                  <SelectTrigger><SelectValue placeholder="Choose role" /></SelectTrigger>
                  <SelectContent>
                    {(roles ?? []).map((r) => (
                      <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={invite.isPending || !form.roleId}
              >
                {invite.isPending && <Loader2 size={14} className="mr-2 animate-spin" />}
                Send invitation
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
