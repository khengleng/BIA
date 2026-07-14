'use client'

import { useState, useEffect } from 'react'
import { Globe } from 'lucide-react'
import i18n from '@/i18n'

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'km', name: 'ខ្មែរ', flag: '🇰🇭' },
  { code: 'zh', name: '中文', flag: '🇨🇳' }
]

export default function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentLanguage, setCurrentLanguage] = useState('en')

  useEffect(() => {
    // Reflect the language i18n actually resolved (saved choice or browser),
    // and keep the button in sync if the language changes elsewhere.
    setCurrentLanguage(i18n.language || 'en')
    const onChange = (lng: string) => setCurrentLanguage(lng)
    i18n.on('languageChanged', onChange)
    return () => { i18n.off('languageChanged', onChange) }
  }, [])

  const handleLanguageChange = (languageCode: string) => {
    setCurrentLanguage(languageCode)
    setIsOpen(false)

    // Apply immediately so the whole app re-renders (i18n persists the choice
    // to localStorage via its languageChanged handler).
    i18n.changeLanguage(languageCode)

    // Keep broadcasting for any other listeners.
    window.dispatchEvent(new CustomEvent('languageChanged', {
      detail: { language: languageCode }
    }))
  }

  const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors rounded-md hover:bg-white/10"
      >
        <Globe className="w-4 h-4" />
        <span>{currentLang.flag}</span>
        <span className="hidden sm:inline">{currentLang.name}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white/10 backdrop-blur-sm border border-white/20 rounded-md shadow-lg z-50">
          <div className="py-1">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-white/10 transition-colors flex items-center space-x-3 ${currentLanguage === language.code
                    ? 'text-white bg-white/20'
                    : 'text-gray-300 hover:text-white'
                  }`}
              >
                <span className="text-lg">{language.flag}</span>
                <span>{language.name}</span>
                {currentLanguage === language.code && (
                  <span className="ml-auto text-blue-400">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
