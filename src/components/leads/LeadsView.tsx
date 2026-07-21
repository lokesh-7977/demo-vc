import { useMemo, useRef, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Loader2, Plus, Search, Trash2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DataTable } from '@/components/common/DataTable'
import {
  useContacts,
  useCreateContact,
  useDeleteContact,
  useImportContacts,
  type Contact,
} from '@/lib/queries'
import { fmtDateTime } from '@/lib/format'

export function LeadsView() {
  const [search, setSearch] = useState('')
  const { data, isLoading } = useContacts(search || undefined)
  const contacts = data?.items ?? []

  const createContact = useCreateContact()
  const deleteContact = useDeleteContact()
  const importContacts = useImportContacts()
  const fileRef = useRef<HTMLInputElement>(null)

  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', email: '' })

  const columns = useMemo<ColumnDef<Contact>[]>(
    () => [
      {
        header: 'Name',
        accessorFn: (c) =>
          [c.firstName, c.lastName].filter(Boolean).join(' ') || '—',
        cell: ({ getValue }) => (
          <span className="font-medium text-text-strong">{getValue<string>()}</span>
        ),
      },
      { header: 'Phone', accessorKey: 'phone' },
      {
        header: 'Email',
        accessorFn: (c) => c.email ?? '—',
      },
      {
        header: 'Source',
        accessorFn: (c) => c.source ?? 'manual',
        cell: ({ getValue }) => (
          <span className="rounded-md bg-surface-strong px-1.5 py-0.5 text-[10px] capitalize text-text-soft">
            {getValue<string>().replaceAll('_', ' ')}
          </span>
        ),
      },
      {
        header: 'Added',
        accessorFn: (c) => fmtDateTime(c.createdAt),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <button
            onClick={async (e) => {
              e.stopPropagation()
              try {
                await deleteContact.mutateAsync(row.original.id)
                toast.success('Contact deleted')
              } catch (err) {
                toast.error(err instanceof Error ? err.message : 'Delete failed')
              }
            }}
            className="rounded-md p-1.5 text-text-faint hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 size={13} />
          </button>
        ),
      },
    ],
    [deleteContact],
  )

  const handleImport = async (file: File) => {
    try {
      const result = await importContacts.mutateAsync(file)
      toast.success(
        `Imported: ${result.created} new, ${result.updated} updated, ${result.skipped} skipped`,
      )
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Import failed')
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createContact.mutateAsync({
        phone: form.phone,
        firstName: form.firstName || undefined,
        lastName: form.lastName || undefined,
        email: form.email || undefined,
      })
      toast.success('Contact added')
      setAddOpen(false)
      setForm({ firstName: '', lastName: '', phone: '', email: '' })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Add failed')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative w-72">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-faint"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, phone or email…"
            className="h-9 pl-8"
          />
        </div>
        <span className="text-xs text-text-faint">{data?.total ?? 0} contacts</span>
        <div className="ml-auto flex gap-2">
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleImport(f)
              e.target.value = ''
            }}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileRef.current?.click()}
            disabled={importContacts.isPending}
          >
            {importContacts.isPending ? (
              <Loader2 size={14} className="mr-1 animate-spin" />
            ) : (
              <Upload size={14} className="mr-1" />
            )}
            Import CSV
          </Button>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus size={14} className="mr-1" /> Add contact
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-text-faint" />
        </div>
      ) : (
        <DataTable columns={columns} data={contacts} />
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Add contact</DialogTitle>
            <DialogDescription>
              Phone is required — 10-digit numbers assume +91.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>First name</Label>
                <Input
                  value={form.firstName}
                  onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Last name</Label>
                <Input
                  value={form.lastName}
                  onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Phone *</Label>
              <Input
                required
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="+91 98765 43210"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <Button type="submit" className="w-full" disabled={createContact.isPending}>
              {createContact.isPending && <Loader2 size={14} className="mr-2 animate-spin" />}
              Add contact
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
