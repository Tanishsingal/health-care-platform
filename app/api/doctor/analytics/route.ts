import { NextResponse } from 'next/server'
import { query } from '@/lib/database'
import { verifyToken } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    // Verify authentication
    const token = request.headers.get('cookie')?.split('token=')[1]?.split(';')[0]
    
    if (!token) {
      console.error('Analytics API: No token found')
      return NextResponse.json(
        { success: false, error: 'Unauthorized - No token provided' },
        { status: 401 }
      )
    }

    const decoded = await verifyToken(token)
    
    if (!decoded) {
      console.error('Analytics API: Token verification failed')
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid token' },
        { status: 401 }
      )
    }
    
    if (decoded.role !== 'doctor') {
      console.error(`Analytics API: Access denied for role: ${decoded.role}`)
      return NextResponse.json(
        { success: false, error: 'Forbidden - Doctor access only. You are logged in as a nurse.' },
        { status: 403 }
      )
    }

    const userId = decoded.userId

    // Get doctor ID
    const doctorResult = await query(
      'SELECT id FROM doctors WHERE user_id = $1',
      [userId]
    )

    if (doctorResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Doctor not found' },
        { status: 404 }
      )
    }

    const doctorId = doctorResult.rows[0].id

    // 1. Patient Statistics
    const patientStatsQuery = await query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as new_this_month,
        COUNT(CASE WHEN last_visit >= NOW() - INTERVAL '90 days' THEN 1 END) as active_patients
      FROM patients
      WHERE doctor_id = $1
    `, [doctorId])

    const patientGenderQuery = await query(`
      SELECT 
        up.gender,
        COUNT(*) as count
      FROM patients p
      JOIN user_profiles up ON p.user_id = up.user_id
      WHERE p.doctor_id = $1
      GROUP BY up.gender
    `, [doctorId])

    const genderStats = {
      male: 0,
      female: 0,
      other: 0
    }

    patientGenderQuery.rows.forEach(row => {
      const gender = (row.gender || 'other').toLowerCase()
      if (gender === 'male') genderStats.male = parseInt(row.count)
      else if (gender === 'female') genderStats.female = parseInt(row.count)
      else genderStats.other = parseInt(row.count)
    })

    // 2. Appointment Statistics
    const appointmentStatsQuery = await query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status IN ('scheduled', 'confirmed') AND appointment_date >= NOW() THEN 1 END) as upcoming,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
        AVG(duration_minutes) as avg_duration
      FROM appointments
      WHERE doctor_id = $1
    `, [doctorId])

    const appointmentStats = appointmentStatsQuery.rows[0]
    const completionRate = appointmentStats.total > 0 
      ? Math.round((appointmentStats.completed / appointmentStats.total) * 100) 
      : 0

    // 3. Prescription Statistics
    const prescriptionStatsQuery = await query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed
      FROM prescriptions
      WHERE doctor_id = $1
    `, [doctorId])

    const topMedicationsQuery = await query(`
      SELECT 
        medication_name,
        COUNT(*) as count
      FROM prescriptions
      WHERE doctor_id = $1
      GROUP BY medication_name
      ORDER BY count DESC
      LIMIT 5
    `, [doctorId])

    // 4. Lab Test Statistics
    const labTestStatsQuery = await query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN lt.status IN ('ordered', 'in_progress') THEN 1 END) as pending,
        COUNT(CASE WHEN lt.status = 'completed' THEN 1 END) as completed
      FROM lab_orders lo
      JOIN lab_tests lt ON lo.id = lt.lab_order_id
      WHERE lo.doctor_id = $1
    `, [doctorId])

    const topLabTestsQuery = await query(`
      SELECT 
        lt.test_name,
        COUNT(*) as count
      FROM lab_orders lo
      JOIN lab_tests lt ON lo.id = lt.lab_order_id
      WHERE lo.doctor_id = $1
      GROUP BY lt.test_name
      ORDER BY count DESC
      LIMIT 5
    `, [doctorId])

    // 5. Recent Activity
    const recentActivityQuery = await query(`
      SELECT 
        'appointment' as type,
        'Appointment with ' || up.first_name || ' ' || up.last_name as description,
        a.created_at as timestamp
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN user_profiles up ON p.user_id = up.user_id
      WHERE a.doctor_id = $1
      
      UNION ALL
      
      SELECT 
        'prescription' as type,
        'Prescribed ' || pr.medication_name || ' to ' || up.first_name || ' ' || up.last_name as description,
        pr.created_at as timestamp
      FROM prescriptions pr
      JOIN patients p ON pr.patient_id = p.id
      JOIN user_profiles up ON p.user_id = up.user_id
      WHERE pr.doctor_id = $1
      
      UNION ALL
      
      SELECT 
        'lab_test' as type,
        'Ordered ' || lt.test_name || ' for ' || up.first_name || ' ' || up.last_name as description,
        lo.created_at as timestamp
      FROM lab_orders lo
      JOIN lab_tests lt ON lo.id = lt.lab_order_id
      JOIN patients p ON lo.patient_id = p.id
      JOIN user_profiles up ON p.user_id = up.user_id
      WHERE lo.doctor_id = $1
      
      ORDER BY timestamp DESC
      LIMIT 20
    `, [doctorId])

    const analyticsData = {
      patientStats: {
        total: parseInt(patientStatsQuery.rows[0]?.total || '0'),
        newThisMonth: parseInt(patientStatsQuery.rows[0]?.new_this_month || '0'),
        activePatients: parseInt(patientStatsQuery.rows[0]?.active_patients || '0'),
        byGender: genderStats
      },
      appointmentStats: {
        total: parseInt(appointmentStats?.total || '0'),
        completed: parseInt(appointmentStats?.completed || '0'),
        upcoming: parseInt(appointmentStats?.upcoming || '0'),
        cancelled: parseInt(appointmentStats?.cancelled || '0'),
        avgDuration: Math.round(parseFloat(appointmentStats?.avg_duration) || 30),
        completionRate
      },
      prescriptionStats: {
        total: parseInt(prescriptionStatsQuery.rows[0]?.total || '0'),
        active: parseInt(prescriptionStatsQuery.rows[0]?.active || '0'),
        completed: parseInt(prescriptionStatsQuery.rows[0]?.completed || '0'),
        topMedications: topMedicationsQuery.rows.map(row => ({
          name: row.medication_name || 'Unknown',
          count: parseInt(row.count || '0')
        }))
      },
      labTestStats: {
        total: parseInt(labTestStatsQuery.rows[0]?.total || '0'),
        pending: parseInt(labTestStatsQuery.rows[0]?.pending || '0'),
        completed: parseInt(labTestStatsQuery.rows[0]?.completed || '0'),
        topTests: topLabTestsQuery.rows.map(row => ({
          name: row.test_name || 'Unknown',
          count: parseInt(row.count || '0')
        }))
      },
      recentActivity: recentActivityQuery.rows || []
    }

    console.log('Analytics API: Successfully fetched data for doctor:', doctorId)

    return NextResponse.json({
      success: true,
      data: analyticsData
    })

  } catch (error) {
    console.error('Analytics fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}

