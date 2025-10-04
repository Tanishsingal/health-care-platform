"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { X, User, Phone, Mail, Calendar, MapPin, Briefcase, AlertCircle, DollarSign } from "lucide-react"

interface StaffManagementModalProps {
  isOpen: boolean
  onClose: () => void
  mode: 'view' | 'edit' | 'add'
  staff?: any
  onSuccess: () => void
}

export default function StaffManagementModal({
  isOpen,
  onClose,
  mode,
  staff,
  onSuccess
}: StaffManagementModalProps) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    password: '',
    date_of_birth: '',
    gender: '',
    role: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    status: 'active',
    // Doctor-specific fields
    specialization: '',
    department: '',
    license_number: '',
    consultation_fee: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (staff && (mode === 'edit' || mode === 'view')) {
      // Format date_of_birth to yyyy-MM-dd for HTML5 date input
      let formattedDate = '';
      if (staff.date_of_birth) {
        try {
          const date = new Date(staff.date_of_birth);
          formattedDate = date.toISOString().split('T')[0];
        } catch (e) {
          console.error('Error formatting date:', e);
        }
      }

      setFormData({
        first_name: staff.first_name || '',
        last_name: staff.last_name || '',
        phone: staff.phone || '',
        email: staff.email || '',
        password: '',
        date_of_birth: formattedDate,
        gender: staff.gender || '',
        role: staff.role || '',
        address: staff.address || '',
        city: staff.city || '',
        state: staff.state || '',
        pincode: staff.pincode || '',
        status: staff.status || 'active',
        specialization: staff.specialization || '',
        department: staff.department || '',
        license_number: staff.license_number || '',
        consultation_fee: staff.consultation_fee || ''
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
        role: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        status: 'active',
        specialization: '',
        department: '',
        license_number: '',
        consultation_fee: ''
      })
    }
  }, [staff, mode])

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
        // Validate password for new staff
        if (!formData.password || formData.password.length < 6) {
          setError('Password must be at least 6 characters')
          setIsSubmitting(false)
          return
        }

        // Validate role
        if (!formData.role) {
          setError('Please select a role')
          setIsSubmitting(false)
          return
        }

        // Validate doctor-specific fields
        if (formData.role === 'doctor' && (!formData.specialization || !formData.license_number)) {
          setError('Doctors require specialization and license number')
          setIsSubmitting(false)
          return
        }

        const response = await fetch('/api/admin/staff', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })

        const data = await response.json()

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to create staff member')
        }

        alert('Staff member created successfully!')
        onSuccess()
        onClose()
      } else if (mode === 'edit') {
        const response = await fetch(`/api/admin/staff/${staff.user_id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })

        const data = await response.json()

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to update staff member')
        }

        alert('Staff member updated successfully!')
        onSuccess()
        onClose()
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      console.error('Staff management error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this staff member? This action cannot be undone.')) {
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/admin/staff/${staff.user_id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete staff member')
      }

      alert('Staff member deleted successfully!')
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      console.error('Delete staff error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  const isReadOnly = mode === 'view'
  const isDoctor = formData.role === 'doctor'

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">
              {mode === 'view' && 'View Staff Member Details'}
              {mode === 'edit' && 'Edit Staff Member'}
              {mode === 'add' && 'Add New Staff Member'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {mode === 'view' && 'Staff member information and credentials'}
              {mode === 'edit' && 'Update staff member information'}
              {mode === 'add' && 'Create a new staff account'}
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

          {/* Role Selection (Add mode only) */}
          {mode === 'add' && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Role</h3>
              </div>
              <div>
                <Label htmlFor="role">Staff Role *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleSelectChange('role', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="doctor">Doctor</SelectItem>
                    <SelectItem value="nurse">Nurse</SelectItem>
                    <SelectItem value="lab_technician">Lab Technician</SelectItem>
                    <SelectItem value="pharmacist">Pharmacist</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
                <Label htmlFor="date_of_birth">Date of Birth</Label>
                <Input
                  id="date_of_birth"
                  name="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                />
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
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

          {/* Doctor-Specific Fields */}
          {(isDoctor || (mode === 'view' && staff?.role === 'doctor')) && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Professional Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="specialization">Specialization *</Label>
                  <Input
                    id="specialization"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    required={isDoctor && mode === 'add'}
                    disabled={isReadOnly}
                    placeholder="e.g., Cardiology, Pediatrics"
                  />
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    disabled={isReadOnly}
                    placeholder="e.g., Emergency, Surgery"
                  />
                </div>
                <div>
                  <Label htmlFor="license_number">License Number *</Label>
                  <Input
                    id="license_number"
                    name="license_number"
                    value={formData.license_number}
                    onChange={handleInputChange}
                    required={isDoctor && mode === 'add'}
                    disabled={isReadOnly}
                  />
                </div>
                <div>
                  <Label htmlFor="consultation_fee">Consultation Fee</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="consultation_fee"
                      name="consultation_fee"
                      type="number"
                      value={formData.consultation_fee}
                      onChange={handleInputChange}
                      disabled={isReadOnly}
                      className="pl-9"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

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
          {mode === 'view' && staff && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Account Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Staff ID</p>
                  <p className="font-medium">{staff.id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Role</p>
                  <p className="font-medium capitalize">{staff.role.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Account Status</p>
                  <p className="font-medium capitalize">{staff.status}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Joined On</p>
                  <p className="font-medium">
                    {new Date(staff.created_at).toLocaleDateString()}
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
                  Delete Staff Member
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                {mode === 'view' ? 'Close' : 'Cancel'}
              </Button>
              {!isReadOnly && (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : mode === 'add' ? 'Create Staff Member' : 'Save Changes'}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

