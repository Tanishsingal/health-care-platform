"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  FileText,
  Calendar,
  User,
  Search,
  ArrowLeft,
  Heart,
  Newspaper
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useTranslations } from '@/lib/i18n-dynamic'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

export default function BlogsPage() {
  const t = useTranslations()
  const [blogs, setBlogs] = useState<any[]>([])
  const [filteredBlogs, setFilteredBlogs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    fetchBlogs()
  }, [])

  useEffect(() => {
    filterBlogs()
  }, [blogs, searchQuery, selectedCategory])

  const fetchBlogs = async () => {
    try {
      const response = await fetch('/api/blogs')
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setBlogs(result.data)
          setFilteredBlogs(result.data)
        }
      }
    } catch (error) {
      console.error('Failed to fetch blogs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterBlogs = () => {
    let filtered = [...blogs]

    if (searchQuery) {
      filtered = filtered.filter(blog =>
        blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(blog => blog.category === selectedCategory)
    }

    setFilteredBlogs(filtered)
  }

  const categories = Array.from(new Set(blogs.map(blog => blog.category)))

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading blogs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Top Government Bar */}
      <div className="bg-gradient-to-r from-orange-500 via-white to-green-500 h-1"></div>
      
      {/* Header */}
      <header className="border-b bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full shadow-lg">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  {t('common.appName')}
                  <Badge variant="outline" className="text-xs border-orange-500 text-orange-600">{t('common.goi')}</Badge>
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">{t('common.tagline')}</p>
              </div>
            </Link>
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  {t('nav.backToHome')}
                </Button>
              </Link>
            </div>
          </div>

          {/* Hero Section */}
          <div className="text-center max-w-3xl mx-auto py-8">
            <Badge className="mb-4 bg-orange-500 text-base px-4 py-2">
              <Newspaper className="w-4 h-4 inline mr-2" />
              {t('home.blogs.title')}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-600 via-blue-600 to-green-600 bg-clip-text text-transparent">
              Healthcare News & Updates
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
              {t('home.blogs.subtitle')}
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search blogs by title, content, or author..."
                className="pl-12 h-12 text-base border-2 focus:border-orange-500"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="lg"
            onClick={() => setSelectedCategory('all')}
            className={selectedCategory === 'all' ? 'bg-gradient-to-r from-orange-500 to-orange-600' : ''}
          >
            All Categories
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="lg"
              onClick={() => setSelectedCategory(category)}
              className={selectedCategory === category ? 'bg-gradient-to-r from-blue-500 to-blue-600' : ''}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Results Count */}
        <div className="text-center mb-6">
          <p className="text-gray-600 dark:text-gray-400">
            Showing <strong className="text-orange-600">{filteredBlogs.length}</strong> {filteredBlogs.length === 1 ? 'blog' : 'blogs'}
            {selectedCategory !== 'all' && <span> in <strong className="text-blue-600">{selectedCategory}</strong></span>}
          </p>
        </div>

        {/* Blog Grid */}
        {filteredBlogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBlogs.map((blog) => (
              <Link key={blog.id} href={`/blogs/${blog.slug}`}>
                <Card className="h-full hover:shadow-2xl transition-all hover:-translate-y-2 cursor-pointer overflow-hidden border-2 hover:border-orange-400 group">
                  {blog.featured_image ? (
                    <div className="w-full h-56 bg-gradient-to-br from-orange-100 to-green-100 overflow-hidden">
                      <img
                        src={blog.featured_image}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-56 bg-gradient-to-br from-orange-100 to-green-100 flex items-center justify-center">
                      <Newspaper className="w-20 h-20 text-orange-300" />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className="bg-orange-500">{blog.category}</Badge>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(blog.published_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <CardTitle className="line-clamp-2 text-xl group-hover:text-orange-600 transition-colors">
                      {blog.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-3 text-base">
                      {blog.excerpt}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <User className="w-4 h-4" />
                      <span className="font-medium">{blog.first_name} {blog.last_name}</span>
                    </div>
                    {blog.tags && blog.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {blog.tags.slice(0, 3).map((tag: string) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-12 h-12 text-orange-400" />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-200">No blogs found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchQuery || selectedCategory !== 'all'
                ? 'Try adjusting your search or filter to find more content'
                : 'No blogs have been published yet. Check back soon!'}
            </p>
            {(searchQuery || selectedCategory !== 'all') && (
              <Button 
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('all')
                }}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Footer Stripe */}
      <div className="bg-gradient-to-r from-orange-500 via-white to-green-500 h-1 mt-12"></div>
    </div>
  )
}
