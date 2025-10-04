"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { X, User, Phone, Mail, Calendar, MapPin, Heart, AlertCircle } from "lucide-react"

interface PatientManagementModalProps {
  isOpen: boolean
  onClose: () => void
  mode: 'view' | 'edit' | 'add'
  patient?: any
  onSuccess: () => void
}

export default function PatientManagementModal({
  isOpen,
  onClose,
  mode,
  patient,
  onSuccess
}: PatientManagementModalProps) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    password: '',
    date_of_birth: '',
    gender: '',
    blood_group: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    status: 'active'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (patient && (mode === 'edit' || mode === 'view')) {
      // Format date_of_birth to yyyy-MM-dd for HTML5 date input
      let formattedDate = '';
      if (patient.date_of_birth) {
        try {
          const date = new Date(patient.date_of_birth);
          formattedDate = date.toISOString().split('T')[0];
        } catch (e) {
          console.error('Error formatting date:', e);
        }
      }

      setFormData({
        first_name: patient.first_name || '',
        last_name: patient.last_name || '',
        phone: patient.phone || '',
        email: patient.email || '',
        password: '',
        date_of_birth: formattedDate,
        gender: patient.gender || '',
        blood_group: patient.blood_group || '',
        emergency_contact_name: patient.emergency_contact_name || '',
        emergency_contact_phone: patient.emergency_contact_phone || '',
        address: patient.address || '',
        city: patient.city || '',
        state: patient.state || '',
        pincode: patient.pincode || '',
        status: patient.status || 'active'
      })
    } else if (mode === 'add') {
      setFormData({
        first_name: '',
        last_name: '',
        phone: '',
        email: '',
        password: '',
        date_of_birth: '',
        gender: '',
        blood_group: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        status: 'active'
      })
    }
  }, [patient, mode])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      if (mode === 'add') {
        // Validate password for new patient
        if (!formData.password || formData.password.length < 6) {
          setError('Password must be at least 6 characters')
          setIsSubmitting(false)
          return
        }

        const response = await fetch('/api/admin/patients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })

        const data = await response.json()

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to create patient')
        }

        alert('Patient created successfully!')
        onSuccess()
        onClose()
      } else if (mode === 'edit') {
        const response = await fetch(`/api/admin/patients/${patient.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })

        const data = await response.json()

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to update patient')
        }

        alert('Patient updated successfully!')
        onSuccess()
        onClose()
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      console.error('Patient management error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this patient? This action cannot be undone.')) {
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/admin/patients/${patient.id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete patient')
      }

      alert('Patient deleted successfully!')
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      console.error('Delete patient error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  const isReadOnly = mode === 'view'

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">
              {mode === 'view' && 'View Patient Details'}
              {mode === 'edit' && 'Edit Patient'}
              {mode === 'add' && 'Add New Patient'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {mode === 'view' && 'Patient information and medical details'}
              {mode === 'edit' && 'Update patient information'}
              {mode === 'add' && 'Create a new patient account'}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Personal Information */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Personal Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  required
                  disabled={isReadOnly}
                />
              </div>
              <div>
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  required
                  disabled={isReadOnly}
                />
              </div>
              <div>
                <Label htmlFor="date_of_birth">Date of Birth *</Label>
                <Input
                  id="date_of_birth"
                  name="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={handleInputChange}
                  required
                  disabled={isReadOnly}
                />
              </div>
              <div>
                <Label htmlFor="gender">Gender *</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => handleSelectChange('gender', value)}
                  disabled={isReadOnly}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="blood_group">Blood Group</Label>
                <Select
                  value={formData.blood_group}
                  onValueChange={(value) => handleSelectChange('blood_group', value)}
                  disabled={isReadOnly}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {mode === 'edit' && (
                <div>
                  <Label htmlFor="status">Account Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleSelectChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Phone className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Contact Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={isReadOnly || mode === 'edit'}
                />
                {mode === 'edit' && (
                  <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                )}
              </div>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  disabled={isReadOnly}
                />
              </div>
              {mode === 'add' && (
                <div className="md:col-span-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    minLength={6}
                    placeholder="Minimum 6 characters"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Emergency Contact */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Emergency Contact</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="emergency_contact_name">Contact Name</Label>
                <Input
                  id="emergency_contact_name"
                  name="emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                />
              </div>
              <div>
                <Label htmlFor="emergency_contact_phone">Contact Phone</Label>
                <Input
                  id="emergency_contact_phone"
                  name="emergency_contact_phone"
                  type="tel"
                  value={formData.emergency_contact_phone}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Address</h3>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="address">Street Address</Label>
                <Textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={2}
                  disabled={isReadOnly}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    disabled={isReadOnly}
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    disabled={isReadOnly}
                  />
                </div>
                <div>
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    disabled={isReadOnly}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* View Mode Additional Info */}
          {mode === 'view' && patient && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Account Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Patient ID</p>
                  <p className="font-medium">{patient.id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Account Status</p>
                  <p className="font-medium capitalize">{patient.status}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Appointments</p>
                  <p className="font-medium">{patient.appointment_count || 0}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Registered On</p>
                  <p className="font-medium">
                    {new Date(patient.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              {mode === 'edit' && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                >
                  Delete Patient
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                {mode === 'view' ? 'Close' : 'Cancel'}
              </Button>
              {!isReadOnly && (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : mode === 'add' ? 'Create Patient' : 'Save Changes'}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

