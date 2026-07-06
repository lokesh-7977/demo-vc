import { createFileRoute } from '@tanstack/react-router'
import { SettingsView } from '@/components/settings/SettingsView'

export const Route = createFileRoute('/_app/settings')({
  component: Settings,
})

function Settings() {
  return (
    <div className="mx-auto max-w-6xl">
      <SettingsView />
    </div>
  )
}
