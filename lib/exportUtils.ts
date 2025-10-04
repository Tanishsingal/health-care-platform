// Utility functions for exporting data

export function exportToCsv(data: any[], filename: string) {
  if (!data || data.length === 0) {
    alert('No data to export')
    return
  }

  // Get all unique keys from the data
  const headers = Object.keys(data[0])

  // Create CSV header row
  const csvHeader = headers.join(',')

  // Create CSV data rows
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header]
      // Handle values that contain commas or quotes
      if (value === null || value === undefined) {
        return ''
      }
      const stringValue = String(value)
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`
      }
      return stringValue
    }).join(',')
  })

  // Combine header and rows
  const csvContent = [csvHeader, ...csvRows].join('\n')

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function formatPatientDataForExport(patients: any[]) {
  return patients.map(patient => ({
    'Patient ID': patient.id,
    'First Name': patient.first_name || '',
    'Last Name': patient.last_name || '',
    'Email': patient.email || '',
    'Phone': patient.phone || '',
    'Date of Birth': patient.date_of_birth || '',
    'Gender': patient.gender || '',
    'Blood Group': patient.blood_group || '',
    'Address': patient.address || '',
    'City': patient.city || '',
    'State': patient.state || '',
    'Pincode': patient.pincode || '',
    'Emergency Contact Name': patient.emergency_contact_name || '',
    'Emergency Contact Phone': patient.emergency_contact_phone || '',
    'Total Appointments': patient.appointment_count || 0,
    'Account Status': patient.status || '',
    'Registered On': patient.created_at ? new Date(patient.created_at).toLocaleDateString() : ''
  }))
}

export function formatStaffDataForExport(staff: any[]) {
  return staff.map(member => {
    const baseData = {
      'Staff ID': member.id,
      'First Name': member.first_name || '',
      'Last Name': member.last_name || '',
      'Role': member.role ? member.role.replace('_', ' ').toUpperCase() : '',
      'Email': member.email || '',
      'Phone': member.phone || '',
      'Date of Birth': member.date_of_birth || '',
      'Gender': member.gender || '',
      'Address': member.address || '',
      'City': member.city || '',
      'State': member.state || '',
      'Pincode': member.pincode || '',
      'Account Status': member.status || '',
      'Joined On': member.created_at ? new Date(member.created_at).toLocaleDateString() : ''
    }

    // Add doctor-specific fields if applicable
    if (member.role === 'doctor') {
      return {
        ...baseData,
        'Specialization': member.specialization || '',
        'Department': member.department || '',
        'License Number': member.license_number || '',
        'Consultation Fee': member.consultation_fee || ''
      }
    }

    return baseData
  })
}

