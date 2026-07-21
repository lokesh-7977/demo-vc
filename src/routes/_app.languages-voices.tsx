import { createFileRoute } from '@tanstack/react-router'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LanguagesView } from '@/components/languages/LanguagesView'
import { VoicesView } from '@/components/voices/VoicesView'

export const Route = createFileRoute('/_app/languages-voices')({
  component: LanguagesVoices,
})

function LanguagesVoices() {
  return (
    <div className="mx-auto max-w-6xl">
      <Tabs defaultValue="languages">
        <TabsList>
          <TabsTrigger value="languages">Languages</TabsTrigger>
          <TabsTrigger value="voices">Voices</TabsTrigger>
        </TabsList>
        <TabsContent value="languages">
          <LanguagesView />
        </TabsContent>
        <TabsContent value="voices">
          <VoicesView />
        </TabsContent>
      </Tabs>
    </div>
  )
}
