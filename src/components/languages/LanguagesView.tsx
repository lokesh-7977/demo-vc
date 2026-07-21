import { useState } from 'react'
import {
  Globe,
  Search,
  Check,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  useLanguages,
  useIndianLanguages,
  useLanguageStats,
  type LanguageProfile,
} from '@/lib/queries'

export function LanguagesView() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'indian'>('all')
  const { data: allData, isLoading } = useLanguages()
  const { data: indianData } = useIndianLanguages()
  const { data: stats } = useLanguageStats()

  const languages = filter === 'indian' ? (indianData?.languages ?? []) : (allData?.languages ?? [])
  const filtered = search
    ? languages.filter((l) => l.name.toLowerCase().includes(search.toLowerCase()) || l.code.toLowerCase().includes(search.toLowerCase()))
    : languages

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-text-strong">Languages</h1>
        <p className="text-sm text-text-soft">Browse and configure supported languages</p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Total', value: stats.totalLanguages },
            { label: 'Indian', value: stats.indianLanguages },
            { label: 'International', value: stats.internationalLanguages },
            { label: 'Sarvam', value: stats.sarvamSupported },
            { label: 'Smallest.ai', value: stats.smallestAiSupported },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-brand-blue">{s.value}</p>
                <p className="text-xs text-text-faint">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-faint" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search languages..."
            className="pl-9"
          />
        </div>
        <Button size="sm" variant={filter === 'all' ? 'default' : 'ghost'} onClick={() => setFilter('all')}>All</Button>
        <Button size="sm" variant={filter === 'indian' ? 'default' : 'ghost'} onClick={() => setFilter('indian')}>Indian</Button>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-text-soft">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((lang) => (
            <LanguageCard key={lang.code} language={lang} />
          ))}
        </div>
      )}
    </div>
  )
}

function LanguageCard({ language }: { language: LanguageProfile }) {
  return (
    <Card className="hover:bg-surface-strong transition-colors">
      <CardContent className="p-3 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-text-strong">{language.name}</p>
            <span className="text-xs text-text-faint">({language.code})</span>
          </div>
          <p className="text-xs text-text-soft">{language.nativeName} &middot; {language.region}</p>
        </div>
        <div className="flex gap-1">
          {language.isIndian && <Badge variant="secondary" className="text-xs">Indian</Badge>}
          {language.sarvamSupported && <Badge variant="outline" className="text-xs">Sarvam</Badge>}
        </div>
      </CardContent>
    </Card>
  )
}
