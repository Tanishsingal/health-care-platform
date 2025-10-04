/**
 * Dynamic i18n Provider - Database-Driven Translations
 * 
 * This replaces the static JSON file approach with dynamic
 * translations loaded from the database via API.
 */

'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

export type Locale = 'en' | 'hi' | 'ta' | 'te' | 'bn' | 'mr' | 'gu'

export const localeNames: Record<Locale, string> = {
  en: 'English',
  hi: 'हिन्दी',
  ta: 'தமிழ்',
  te: 'తెలుగు',
  bn: 'বাংলা',
  mr: 'मराठी',
  gu: 'ગુજરાતી'
}

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, fallback?: string) => string
  isLoading: boolean
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProviderDynamic({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en')
  const [translations, setTranslations] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState(true)

  // Load translations from API
  const loadTranslations = async (lang: Locale) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/translations?lang=${lang}`)
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setTranslations(result.data)
        }
      }
    } catch (error) {
      console.error('Failed to load translations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Initialize locale from localStorage or default to 'en'
  useEffect(() => {
    const savedLocale = localStorage.getItem('locale') as Locale
    if (savedLocale && localeNames[savedLocale]) {
      setLocaleState(savedLocale)
    }
    loadTranslations(savedLocale || 'en')
  }, [])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem('locale', newLocale)
    loadTranslations(newLocale)
  }

  const t = (key: string, fallback?: string): string => {
    const keys = key.split('.')
    let value: any = translations

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        return fallback || key
      }
    }

    return typeof value === 'string' ? value : (fallback || key)
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, isLoading }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within I18nProviderDynamic')
  }
  return context
}

export function useTranslations(namespace?: string) {
  const { t } = useI18n()
  
  return (key: string, fallback?: string) => {
    const fullKey = namespace ? `${namespace}.${key}` : key
    return t(fullKey, fallback)
  }
}

export function useLocale() {
  const { locale, setLocale } = useI18n()
  return { locale, setLocale }
}

