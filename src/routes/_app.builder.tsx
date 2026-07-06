import { createFileRoute } from '@tanstack/react-router'
import { BuilderView } from '@/components/builder/BuilderView'

export const Route = createFileRoute('/_app/builder')({
  component: BuilderView,
})
