import { createFileRoute } from '@tanstack/react-router'
import { LanguagesView } from '@/components/languages/LanguagesView'

export const Route = createFileRoute('/_app/languages')({ component: Languages })

function Languages() {
  return (
    <div className="mx-auto max-w-6xl">
      <LanguagesView />
    </div>
  )
}
