/**
 * Admin Translation Management UI
 * 
 * Allows admins to:
 * - View all translations
 * - Edit translations
 * - Add new translations
 * - Export/Import translations
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Languages, Search, Plus, Save, Download, Upload, Edit, Check, X } from 'lucide-react'

const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' }
]

export default function TranslationsManagement() {
  const [selectedLanguage, setSelectedLanguage] = useState('en')
  const [translations, setTranslations] = useState<any>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showAddNew, setShowAddNew] = useState(false)
  const [newKey, setNewKey] = useState('')
  const [newValue, setNewValue] = useState('')
  const [newCategory, setNewCategory] = useState('')

  // Load translations
  useEffect(() => {
    loadTranslations()
  }, [selectedLanguage])

  const loadTranslations = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/translations?lang=${selectedLanguage}`)
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

  const flattenTranslations = (obj: any, prefix = ''): Array<{ key: string; value: string }> => {
    const flattened: Array<{ key: string; value: string }> = []

    for (const [key, value] of Object.entries(obj)) {
      const newKey = prefix ? `${prefix}.${key}` : key

      if (typeof value === 'object' && value !== null) {
        flattened.push(...flattenTranslations(value, newKey))
      } else {
        flattened.push({ key: newKey, value: String(value) })
      }
    }

    return flattened
  }

  const filteredTranslations = flattenTranslations(translations).filter(({ key, value }) =>
    key.toLowerCase().includes(searchQuery.toLowerCase()) ||
    value.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleEdit = (key: string, value: string) => {
    setEditingKey(key)
    setEditValue(value)
  }

  const handleSave = async () => {
    if (!editingKey) return

    try {
      const response = await fetch('/api/translations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: editingKey,
          languageCode: selectedLanguage,
          value: editValue,
          category: editingKey.split('.')[0]
        })
      })

      if (response.ok) {
        setEditingKey(null)
        setEditValue('')
        loadTranslations()
        alert('Translation updated successfully!')
      } else {
        alert('Failed to update translation')
      }
    } catch (error) {
      console.error('Error saving translation:', error)
      alert('Error saving translation')
    }
  }

  const handleAddNew = async () => {
    if (!newKey || !newValue) {
      alert('Please fill in all fields')
      return
    }

    try {
      const response = await fetch('/api/translations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: newKey,
          languageCode: selectedLanguage,
          value: newValue,
          category: newCategory || newKey.split('.')[0]
        })
      })

      if (response.ok) {
        setShowAddNew(false)
        setNewKey('')
        setNewValue('')
        setNewCategory('')
        loadTranslations()
        alert('Translation added successfully!')
      } else {
        alert('Failed to add translation')
      }
    } catch (error) {
      console.error('Error adding translation:', error)
      alert('Error adding translation')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Tricolor stripe */}
      <div className="bg-gradient-to-r from-orange-500 via-white to-green-500 h-1"></div>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Badge className="mb-4 bg-blue-600">Translation Management</Badge>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-orange-600 via-blue-600 to-green-600 bg-clip-text text-transparent">
            Manage Translations
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Edit and manage translations for all supported languages
          </p>
        </div>

        {/* Language Selector & Actions */}
        <Card className="mb-6 border-2 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-white dark:from-gray-800 dark:to-gray-900">
            <CardTitle>Language & Actions</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <Label>Select Language</Label>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.native} ({lang.name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => setShowAddNew(!showAddNew)}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New
                </Button>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add New Translation Form */}
        {showAddNew && (
          <Card className="mb-6 border-2 shadow-lg border-green-500">
            <CardHeader className="bg-gradient-to-r from-green-50 to-white dark:from-gray-800 dark:to-gray-900">
              <CardTitle>Add New Translation</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label>Translation Key</Label>
                <Input
                  placeholder="e.g., home.hero.newSection.title"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use dot notation (e.g., category.section.key)
                </p>
              </div>
              <div>
                <Label>Category (optional)</Label>
                <Input
                  placeholder="e.g., home, dashboard, auth"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                />
              </div>
              <div>
                <Label>Translation Value ({selectedLanguage})</Label>
                <Textarea
                  placeholder="Enter the translated text"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddNew} className="bg-green-600 hover:bg-green-700">
                  <Check className="w-4 h-4 mr-2" />
                  Save Translation
                </Button>
                <Button variant="outline" onClick={() => setShowAddNew(false)}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search */}
        <Card className="mb-6 border-2 shadow-lg">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search translations by key or value..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Translations List */}
        <Card className="border-2 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-white dark:from-gray-800 dark:to-gray-900">
            <CardTitle>Translations ({filteredTranslations.length})</CardTitle>
            <CardDescription>
              Edit translations for {LANGUAGES.find(l => l.code === selectedLanguage)?.native}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading translations...</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredTranslations.map(({ key, value }) => (
                  <div
                    key={key}
                    className="p-4 border rounded-lg hover:bg-accent transition-colors"
                  >
                    {editingKey === key ? (
                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs text-muted-foreground">{key}</Label>
                          <Textarea
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            rows={3}
                            className="mt-1"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                            <Check className="w-3 h-3 mr-1" />
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingKey(null)}>
                            <X className="w-3 h-3 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground font-mono">{key}</p>
                          <p className="mt-1">{value}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(key, value)}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    )}
                  </div>
                ))}

                {filteredTranslations.length === 0 && (
                  <div className="text-center py-12">
                    <Languages className="w-12 h-12 mx-auto text-muted-foreground opacity-50 mb-4" />
                    <p className="text-muted-foreground">
                      {searchQuery ? 'No translations found matching your search' : 'No translations available'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Footer stripe */}
      <div className="bg-gradient-to-r from-orange-500 via-white to-green-500 h-1 mt-12"></div>
    </div>
  )
}

