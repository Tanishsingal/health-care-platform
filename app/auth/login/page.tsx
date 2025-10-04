"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Heart, ArrowLeft, Shield, Globe } from "lucide-react"
import { useTranslations } from '@/lib/i18n-dynamic'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

export default function LoginPage() {
  const t = useTranslations()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Login failed')
      }

      const role = data.user.role
      const roleRedirects: Record<string, string> = {
        'super_admin': '/admin',
        'admin': '/admin',
        'doctor': '/doctor',
        'nurse': '/nurse',
        'patient': '/patient',
        'pharmacist': '/pharmacy',
        'lab_technician': '/laboratory',
      }

      const redirectTo = roleRedirects[role] || '/dashboard'
      window.location.href = redirectTo
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail)
    setPassword(demoPassword)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Top Government Bar */}
      <div className="bg-gradient-to-r from-orange-500 via-white to-green-500 h-1"></div>
      
      {/* Header */}
      <header className="border-b bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
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
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Left Side - Info */}
            <div className="space-y-6">
              <div>
                <Badge className="mb-4 bg-orange-500">{t('auth.login.title')}</Badge>
                <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-600 via-blue-600 to-green-600 bg-clip-text text-transparent">
                  {t('common.appName')}
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  {t('auth.login.subtitle')}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border-l-4 border-orange-500">
                  <Shield className="w-6 h-6 text-orange-500 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Secure Access</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Your health data is protected with enterprise-grade encryption and ABDM compliance.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border-l-4 border-blue-500">
                  <Heart className="w-6 h-6 text-blue-500 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Comprehensive Care</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Access appointments, prescriptions, lab reports, and more in one place.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border-l-4 border-green-500">
                  <Globe className="w-6 h-6 text-green-500 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Multi-Language Support</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Available in 7 Indian languages for your convenience.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="space-y-6">
              <Card className="border-2 shadow-xl">
                <CardHeader className="text-center space-y-4 pb-4">
                  <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl mx-auto shadow-lg">
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{t('auth.login.title')}</CardTitle>
                    <CardDescription>{t('auth.login.subtitle')}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">{t('auth.login.email')}</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder={t('auth.login.emailPlaceholder')}
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">{t('auth.login.password')}</Label>
                        <Link href="/auth/forgot-password" className="text-sm text-orange-600 hover:underline">
                          {t('auth.login.forgotPassword')}
                        </Link>
                      </div>
                      <Input
                        id="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-11"
                      />
                    </div>

                    {error && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">{error}</p>
                      </div>
                    )}

                    <Button 
                      type="submit" 
                      className="w-full h-11 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700" 
                      disabled={isLoading}
                    >
                      {isLoading ? t('auth.login.signingIn') : t('auth.login.signIn')}
                    </Button>

                    <div className="text-center text-sm">
                      {t('auth.login.noAccount')}{" "}
                      <Link href="/auth/register" className="text-orange-600 hover:underline font-semibold">
                        {t('auth.login.createAccount')}
                      </Link>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Demo Credentials */}
              <Card className="border-2 border-dashed border-blue-300 bg-blue-50 dark:bg-blue-900/20">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    {t('auth.login.demoTitle')}
                  </CardTitle>
                  <CardDescription className="text-xs">{t('auth.login.demoPassword')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <button 
                    type="button"
                    className="w-full text-left cursor-pointer p-3 rounded-lg border-2 bg-white hover:bg-blue-100 transition-colors text-sm"
                    onClick={() => handleDemoLogin('patient@hospital.com', 'password123')}
                  >
                    <strong>{t('auth.login.patientPortal')}</strong>
                    <div className="text-xs text-gray-600 mt-1">patient@hospital.com</div>
                  </button>
                  <button 
                    type="button"
                    className="w-full text-left cursor-pointer p-3 rounded-lg border-2 bg-white hover:bg-green-100 transition-colors text-sm"
                    onClick={() => handleDemoLogin('doctor@hospital.com', 'password123')}
                  >
                    <strong>{t('auth.login.doctorPortal')}</strong>
                    <div className="text-xs text-gray-600 mt-1">doctor@hospital.com</div>
                  </button>
                  <button 
                    type="button"
                    className="w-full text-left cursor-pointer p-3 rounded-lg border-2 bg-white hover:bg-purple-100 transition-colors text-sm"
                    onClick={() => handleDemoLogin('admin@hospital.com', 'password123')}
                  >
                    <strong>{t('auth.login.adminPortal')}</strong>
                    <div className="text-xs text-gray-600 mt-1">admin@hospital.com</div>
                  </button>
                  <button 
                    type="button"
                    className="w-full text-left cursor-pointer p-3 rounded-lg border-2 bg-white hover:bg-orange-100 transition-colors text-sm"
                    onClick={() => handleDemoLogin('pharmacist@hospital.com', 'password123')}
                  >
                    <strong>{t('auth.login.pharmacyPortal')}</strong>
                    <div className="text-xs text-gray-600 mt-1">pharmacist@hospital.com</div>
                  </button>
                  <button 
                    type="button"
                    className="w-full text-left cursor-pointer p-3 rounded-lg border-2 bg-white hover:bg-teal-100 transition-colors text-sm"
                    onClick={() => handleDemoLogin('nurse@hospital.com', 'password123')}
                  >
                    <strong>{t('auth.login.nursePortal')}</strong>
                    <div className="text-xs text-gray-600 mt-1">nurse@hospital.com</div>
                  </button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Stripe */}
      <div className="bg-gradient-to-r from-orange-500 via-white to-green-500 h-1"></div>
    </div>
  )
}
