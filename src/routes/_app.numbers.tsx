import { createFileRoute } from '@tanstack/react-router'
import { NumbersView } from '@/components/numbers/NumbersView'

export const Route = createFileRoute('/_app/numbers')({
  component: Numbers,
})

function Numbers() {
  return (
    <div className="mx-auto max-w-6xl">
      <NumbersView />
    </div>
  )
}
