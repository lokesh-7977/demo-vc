export type LanguageProfile = {
  code: string
  name: string
  nativeName: string
  region: string
  script: string
  isIndian: boolean
  sarvamSupported: boolean
}

export type LanguageStats = {
  totalLanguages: number
  indianLanguages: number
  internationalLanguages: number
  sarvamSupported: number
  smallestAiSupported: number
  regions: string[]
}
