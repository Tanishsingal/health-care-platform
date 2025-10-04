"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Heart, ArrowLeft, Shield, UserPlus, FileText, Phone } from "lucide-react"
import { useTranslations } from '@/lib/i18n-dynamic'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

export default function RegisterPage() {
  const t = useTranslations()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    dateOfBirth: "",
    gender: "other",
    role: "patient",
    licenseNumber: "",
    specialization: "",
    department: "",
    address: "",
    emergencyContact: "",
    agreeToTerms: false,
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (!formData.agreeToTerms) {
      setError("Please agree to the terms and conditions")
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role: formData.role,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          dateOfBirth: formData.dateOfBirth || undefined,
          gender: formData.gender || undefined,
          address: formData.address || undefined,
          emergencyContact: formData.emergencyContact || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Registration failed')
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
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <Badge className="mb-4 bg-green-600">{t('auth.register.title')}</Badge>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-600 via-blue-600 to-green-600 bg-clip-text text-transparent">
              {t('auth.register.subtitle')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Create your account to access quality healthcare services
            </p>
          </div>

          {/* Registration Form */}
          <Card className="border-2 shadow-xl">
            <CardHeader className="text-center space-y-4">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl mx-auto shadow-lg">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">{t('auth.register.title')}</CardTitle>
                <CardDescription>Fill in your details to get started</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-orange-600">
                    <UserPlus className="w-5 h-5" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">{t('auth.register.fullName')} (First) *</Label>
                      <Input
                        id="firstName"
                        required
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        required
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        className="h-11"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-blue-600">
                    <Phone className="w-5 h-5" />
                    Contact Information
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">{t('auth.register.email')} *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className="h-11"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+91 XXXXX XXXXX"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dateOfBirth">Date of Birth</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                          className="h-11"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security & Role */}
                <div>
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-green-600">
                    <Shield className="w-5 h-5" />
                    Security & Account Type
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="password">{t('auth.register.password')} *</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Min 6 characters"
                          required
                          value={formData.password}
                          onChange={(e) => handleInputChange("password", e.target.value)}
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">{t('auth.register.confirmPassword')} *</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          required
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                          className="h-11"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="gender">Gender</Label>
                        <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                          <SelectTrigger className="h-11">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role">{t('auth.register.role')} *</Label>
                        <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
                          <SelectTrigger className="h-11">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="patient">Patient</SelectItem>
                            <SelectItem value="doctor">Doctor</SelectItem>
                            <SelectItem value="nurse">Nurse</SelectItem>
                            <SelectItem value="pharmacist">Pharmacist</SelectItem>
                            <SelectItem value="lab_technician">Lab Technician</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border-2 border-orange-200">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked as boolean)}
                      className="mt-1"
                    />
                    <Label htmlFor="agreeToTerms" className="text-sm leading-relaxed cursor-pointer">
                      I agree to the{" "}
                      <Link href="/terms" className="text-orange-600 hover:underline font-semibold">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="text-orange-600 hover:underline font-semibold">
                        Privacy Policy
                      </Link>
                      . I understand my health data will be protected under ABDM guidelines.
                    </Label>
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                    <p className="text-sm text-red-600 font-semibold">{error}</p>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700" 
                  disabled={isLoading}
                >
                  {isLoading ? t('auth.register.signingUp') : t('auth.register.signUp')}
                </Button>

                <div className="text-center text-sm">
                  {t('auth.register.hasAccount')}{" "}
                  <Link href="/auth/login" className="text-orange-600 hover:underline font-semibold">
                    {t('auth.register.signIn')}
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Quick Start Notice */}
          <Card className="mt-6 border-2 border-dashed border-blue-300 bg-blue-50 dark:bg-blue-900/20">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Quick Start
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-blue-800 dark:text-blue-200">
              <p>
                Already have demo credentials?{" "}
                <Link href="/auth/login" className="underline font-semibold">
                  Sign in here
                </Link>{" "}
                to access pre-configured accounts for testing.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer Stripe */}
      <div className="bg-gradient-to-r from-orange-500 via-white to-green-500 h-1"></div>
    </div>
  )
}
