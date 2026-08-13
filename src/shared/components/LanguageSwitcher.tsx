import { useTranslation } from 'react-i18next'
import { Select } from '@/shared/components/Select'

const languages = [
  { value: 'pt-BR', label: 'Português (BR)' },
  { value: 'en', label: 'English' },
]

export function LanguageSwitcher() {
  const { i18n } = useTranslation()

  return (
    <Select
      value={i18n.language}
      onChange={(e) => i18n.changeLanguage(e.target.value)}
      options={languages}
    />
  )
}
