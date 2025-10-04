"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Heart, 
  Shield, 
  Users, 
  Calendar, 
  FileText, 
  Activity, 
  ArrowRight, 
  Newspaper,
  Hospital,
  Stethoscope,
  Pill,
  TestTube,
  Phone,
  MapPin,
  Award,
  TrendingUp,
  Globe,
  Sparkles
} from "lucide-react"
import { useTranslations } from '@/lib/i18n-dynamic'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { useEffect, useState } from "react"

export default function HomePage() {
  const t = useTranslations()
  const [blogs, setBlogs] = useState<any[]>([])
  const [isLoadingBlogs, setIsLoadingBlogs] = useState(true)
  const [currentDate, setCurrentDate] = useState('')

  useEffect(() => {
    fetchBlogs()
    // Set date on client-side only to avoid hydration mismatch
    setCurrentDate(new Date().toLocaleDateString())
  }, [])

  const fetchBlogs = async () => {
    try {
      const response = await fetch('/api/blogs')
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setBlogs(result.data.slice(0, 3))
        }
      }
    } catch (error) {
      console.error('Failed to fetch blogs:', error)
    } finally {
      setIsLoadingBlogs(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Top Government Bar */}
      <div className="bg-gradient-to-r from-orange-500 via-white to-green-500 h-1"></div>
      
      {/* Header with Gov Logo */}
      <header className="border-b bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full shadow-lg">
                  <Heart className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    {t('common.appName')}
                    <Badge variant="outline" className="text-xs border-orange-500 text-orange-600">{t('common.goi')}</Badge>
                  </h1>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{t('common.tagline')}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <Link href="/auth/login">
                <Button variant="outline" size="sm" className="border-orange-500 text-orange-600 hover:bg-orange-50">
                  {t('nav.login')}
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm" className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                  {t('nav.register')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, orange 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }}></div>
        </div>
        
        <div className="container mx-auto text-center max-w-5xl relative">
          <Badge variant="secondary" className="mb-6 text-base px-4 py-2 bg-gradient-to-r from-orange-100 to-green-100 border-orange-300">
            <Sparkles className="w-4 h-4 inline mr-2" />
            {t('home.hero.badge')}
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-balance mb-6">
            <span className="bg-gradient-to-r from-orange-600 via-blue-600 to-green-600 bg-clip-text text-transparent">
              {t('home.hero.title')}
            </span>
            <span className="block text-gray-900 dark:text-white mt-2">
              {t('home.hero.subtitle')}
            </span>
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            {t('home.hero.description')}
          </p>
          
          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md border-t-4 border-orange-500">
              <div className="text-3xl font-bold text-orange-600">50Cr+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{t('home.hero.stats.ayushman')}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md border-t-4 border-blue-500">
              <div className="text-3xl font-bold text-blue-600">1.5L+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{t('home.hero.stats.centers')}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md border-t-4 border-green-500">
              <div className="text-3xl font-bold text-green-600">10Cr+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{t('home.hero.stats.treatments')}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md border-t-4 border-purple-500">
              <div className="text-3xl font-bold text-purple-600">24/7</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{t('home.hero.stats.helpline')}</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg">
                <Heart className="w-5 h-5" />
                {t('home.hero.registerButton')}
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="border-2 border-blue-500 text-blue-600 hover:bg-blue-50">
                <Shield className="w-5 h-5 mr-2" />
                {t('home.hero.loginButton')}
              </Button>
            </Link>
          </div>

          {/* Emergency Helpline */}
          <div className="mt-10 flex justify-center">
            <div className="p-6 bg-red-50 dark:bg-red-900/20 border-4 border-red-500 dark:border-red-700 rounded-xl shadow-2xl">
              <div className="flex items-center gap-4 text-red-600 dark:text-red-400">
                <Phone className="w-8 h-8 animate-pulse" />
                <div>
                  <div className="font-bold text-xl mb-1">{t('home.hero.emergency.title')}</div>
                  <div className="text-3xl font-bold tracking-wider">{t('home.hero.emergency.numbers')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Government Schemes */}
      <section className="py-16 px-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-blue-600">{t('home.schemes.title')}</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-orange-600">{t('home.schemes.subtitle')}</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Ayushman Bharat */}
            <Card className="border-2 border-orange-200 hover:border-orange-400 transition-all hover:shadow-xl bg-gradient-to-br from-orange-50 to-white dark:from-gray-800 dark:to-gray-900">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <span>{t('home.schemes.ayushman.title')}</span>
                  <Badge variant="outline" className="text-xs">{t('home.schemes.ayushman.badge')}</Badge>
                </CardTitle>
                <CardDescription className="text-base">
                  {t('home.schemes.ayushman.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full border-orange-500 text-orange-600 hover:bg-orange-50">
                  {t('home.schemes.ayushman.button')}
                </Button>
              </CardContent>
            </Card>

            {/* Janaushadhi */}
            <Card className="border-2 border-green-200 hover:border-green-400 transition-all hover:shadow-xl bg-gradient-to-br from-green-50 to-white dark:from-gray-800 dark:to-gray-900">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <Pill className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl">{t('home.schemes.janAushadhi.title')}</CardTitle>
                <CardDescription className="text-base">
                  {t('home.schemes.janAushadhi.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full border-green-500 text-green-600 hover:bg-green-50">
                  <MapPin className="w-4 h-4 mr-2" />
                  {t('home.schemes.janAushadhi.button')}
                </Button>
              </CardContent>
            </Card>

            {/* HWC */}
            <Card className="border-2 border-blue-200 hover:border-blue-400 transition-all hover:shadow-xl bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <Hospital className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl">{t('home.schemes.hwc.title')}</CardTitle>
                <CardDescription className="text-base">
                  {t('home.schemes.hwc.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full border-blue-500 text-blue-600 hover:bg-blue-50">
                  <MapPin className="w-4 h-4 mr-2" />
                  {t('home.schemes.hwc.button')}
                </Button>
              </CardContent>
            </Card>

            {/* e-Sanjeevani */}
            <Card className="border-2 border-purple-200 hover:border-purple-400 transition-all hover:shadow-xl bg-gradient-to-br from-purple-50 to-white dark:from-gray-800 dark:to-gray-900">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl">{t('home.schemes.eSanjeevani.title')}</CardTitle>
                <CardDescription className="text-base">
                  {t('home.schemes.eSanjeevani.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full border-purple-500 text-purple-600 hover:bg-purple-50">
                  {t('home.schemes.eSanjeevani.button')}
                </Button>
              </CardContent>
            </Card>

            {/* ABHA */}
            <Card className="border-2 border-indigo-200 hover:border-indigo-400 transition-all hover:shadow-xl bg-gradient-to-br from-indigo-50 to-white dark:from-gray-800 dark:to-gray-900">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl">{t('home.schemes.abha.title')}</CardTitle>
                <CardDescription className="text-base">
                  {t('home.schemes.abha.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full border-indigo-500 text-indigo-600 hover:bg-indigo-50">
                  {t('home.schemes.abha.button')}
                </Button>
              </CardContent>
            </Card>

            {/* Emergency */}
            <Card className="border-2 border-red-200 hover:border-red-400 transition-all hover:shadow-xl bg-gradient-to-br from-red-50 to-white dark:from-gray-800 dark:to-gray-900">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <Phone className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl">{t('home.schemes.emergency.title')}</CardTitle>
                <CardDescription className="text-base">
                  {t('home.schemes.emergency.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="destructive" className="w-full">
                  <Phone className="w-4 h-4 mr-2" />
                  {t('home.schemes.emergency.button')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Digital Services */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-blue-600">{t('home.services.title')}</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t('home.services.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-2 hover:border-blue-400 transition-all hover:shadow-lg group">
              <CardHeader>
                <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle>{t('home.services.patient.title')}</CardTitle>
                <CardDescription>
                  {t('home.services.patient.description')}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-green-400 transition-all hover:shadow-lg group">
              <CardHeader>
                <div className="w-14 h-14 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Stethoscope className="w-7 h-7 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle>{t('home.services.doctor.title')}</CardTitle>
                <CardDescription>
                  {t('home.services.doctor.description')}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-purple-400 transition-all hover:shadow-lg group">
              <CardHeader>
                <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <TestTube className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle>{t('home.services.lab.title')}</CardTitle>
                <CardDescription>
                  {t('home.services.lab.description')}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-orange-400 transition-all hover:shadow-lg group">
              <CardHeader>
                <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Shield className="w-7 h-7 text-orange-600 dark:text-orange-400" />
                </div>
                <CardTitle>{t('home.services.security.title')}</CardTitle>
                <CardDescription>
                  {t('home.services.security.description')}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Blogs */}
      {blogs.length > 0 && (
        <section className="py-16 px-4 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl font-bold mb-2">{t('home.blogs.title')}</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('home.blogs.subtitle')}
                </p>
              </div>
              <Link href="/blogs">
                <Button variant="outline" className="gap-2">
                  {t('home.blogs.viewAll')}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            {isLoadingBlogs ? (
              <div className="grid md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="w-full h-48 bg-gray-200 dark:bg-gray-700"></div>
                    <CardHeader>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1"></div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-6">
                {blogs.map((blog) => (
                  <Link key={blog.id} href={`/blogs/${blog.slug}`}>
                    <Card className="h-full hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer overflow-hidden group border-2 hover:border-blue-400">
                      {blog.featured_image ? (
                        <div className="w-full h-48 bg-gradient-to-br from-orange-100 to-green-100 overflow-hidden">
                          <img
                            src={blog.featured_image}
                            alt={blog.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-48 bg-gradient-to-br from-orange-100 to-green-100 flex items-center justify-center">
                          <Newspaper className="w-16 h-16 text-orange-400" />
                        </div>
                      )}
                      <CardHeader>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="text-xs bg-orange-500">
                            {blog.category}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(blog.published_at).toLocaleDateString()}
                          </span>
                        </div>
                        <CardTitle className="line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {blog.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-3">
                          {blog.excerpt}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-orange-500 via-blue-500 to-green-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        <div className="container mx-auto text-center max-w-4xl relative">
          <div className="inline-block mb-6">
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-2">
              <Sparkles className="w-5 h-5" />
              <span className="font-semibold">{t('home.cta.badge')}</span>
            </div>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            {t('home.cta.title')}
          </h2>
          <p className="text-xl mb-8 opacity-95">
            {t('home.cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="gap-2 bg-white text-blue-600 hover:bg-gray-100 shadow-xl">
                <Heart className="w-5 h-5" />
                {t('home.cta.registerButton')}
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="gap-2 border-2 border-white text-white hover:bg-white/10">
              <Phone className="w-5 h-5" />
              {t('home.cta.helplineButton')}
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold mb-4 text-orange-600">{t('home.footer.schemes')}</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-orange-600">{t('home.footer.ayushman')}</a></li>
                <li><a href="#" className="hover:text-orange-600">{t('home.footer.janAushadhi')}</a></li>
                <li><a href="#" className="hover:text-orange-600">{t('home.footer.abdm')}</a></li>
                <li><a href="#" className="hover:text-orange-600">{t('home.footer.eSanjeevani')}</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-blue-600">{t('home.footer.services')}</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-blue-600">{t('home.footer.appointments')}</a></li>
                <li><a href="#" className="hover:text-blue-600">{t('home.footer.prescriptions')}</a></li>
                <li><a href="#" className="hover:text-blue-600">{t('home.footer.labReports')}</a></li>
                <li><a href="#" className="hover:text-blue-600">{t('home.footer.telemedicine')}</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-green-600">{t('home.footer.contact')}</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>{t('home.footer.emergency')}</li>
                <li>{t('home.footer.covidHelpline')}</li>
                <li>{t('home.footer.healthHelpline')}</li>
                <li>{t('home.footer.tollFree')}</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-purple-600">{t('home.footer.links')}</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><a href="https://www.india.gov.in" className="hover:text-purple-600">{t('home.footer.indiaGov')}</a></li>
                <li><a href="https://www.mohfw.gov.in" className="hover:text-purple-600">{t('home.footer.mohfw')}</a></li>
                <li><a href="https://abdm.gov.in" className="hover:text-purple-600">{t('home.footer.abdm')}</a></li>
                <li><a href="https://pmjay.gov.in" className="hover:text-purple-600">PM-JAY</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t pt-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg">{t('common.appName')}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {t('home.footer.copyright')}
            </p>
            <p className="text-xs text-gray-500">
              {t('home.footer.lastUpdated')} {currentDate || '2024'} | {t('home.footer.contentOwner')}
            </p>
          </div>
        </div>
      </footer>

      {/* Government India Stripe */}
      <div className="bg-gradient-to-r from-orange-500 via-white to-green-500 h-1"></div>
    </div>
  )
}
