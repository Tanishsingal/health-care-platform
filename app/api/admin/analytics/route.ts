import { NextResponse } from 'next/server'
import { query } from '@/lib/database'
import { verifyToken } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    // Verify authentication
    const token = request.headers.get('cookie')?.split('token=')[1]?.split(';')[0]
    
    if (!token) {
      console.error('Admin Analytics API: No token found')
      return NextResponse.json(
        { success: false, error: 'Unauthorized - No token provided' },
        { status: 401 }
      )
    }

    const decoded = await verifyToken(token)
    
    if (!decoded) {
      console.error('Admin Analytics API: Token verification failed')
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid token' },
        { status: 401 }
      )
    }
    
    if (decoded.role !== 'admin' && decoded.role !== 'super_admin') {
      console.error(`Admin Analytics API: Access denied for role: ${decoded.role}`)
      return NextResponse.json(
        { success: false, error: 'Forbidden - Admin access only' },
        { status: 403 }
      )
    }

    // 1. System Overview
    const systemOverviewQuery = await query(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE status IN ('active', 'inactive')) as total_users,
        (SELECT COUNT(*) FROM patients) as total_patients,
        (SELECT COUNT(*) FROM doctors) as total_doctors,
        (SELECT COUNT(*) FROM users WHERE role IN ('doctor', 'nurse', 'lab_technician', 'pharmacist') AND status IN ('active', 'inactive')) as total_staff,
        (SELECT COUNT(*) FROM users WHERE created_at >= NOW() - INTERVAL '30 days' AND status IN ('active', 'inactive')) as new_users_this_month,
        (SELECT COUNT(*) FROM users WHERE status = 'active') as active_users
    `)

    const systemOverview = {
      totalUsers: parseInt(systemOverviewQuery.rows[0]?.total_users || '0'),
      totalPatients: parseInt(systemOverviewQuery.rows[0]?.total_patients || '0'),
      totalDoctors: parseInt(systemOverviewQuery.rows[0]?.total_doctors || '0'),
      totalStaff: parseInt(systemOverviewQuery.rows[0]?.total_staff || '0'),
      newUsersThisMonth: parseInt(systemOverviewQuery.rows[0]?.new_users_this_month || '0'),
      activeUsers: parseInt(systemOverviewQuery.rows[0]?.active_users || '0')
    }

    // 2. Patient Statistics
    const patientStatsQuery = await query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN p.created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as new_this_month,
        COUNT(CASE WHEN p.last_visit >= NOW() - INTERVAL '90 days' THEN 1 END) as active_patients
      FROM patients p
    `)

    const patientGenderQuery = await query(`
      SELECT 
        up.gender,
        COUNT(*) as count
      FROM patients p
      JOIN user_profiles up ON p.user_id = up.user_id
      GROUP BY up.gender
    `)

    const patientBloodGroupQuery = await query(`
      SELECT 
        blood_group,
        COUNT(*) as count
      FROM patients
      WHERE blood_group IS NOT NULL
      GROUP BY blood_group
      ORDER BY count DESC
    `)

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

    const patientStats = {
      total: parseInt(patientStatsQuery.rows[0]?.total || '0'),
      newThisMonth: parseInt(patientStatsQuery.rows[0]?.new_this_month || '0'),
      activePatients: parseInt(patientStatsQuery.rows[0]?.active_patients || '0'),
      byGender: genderStats,
      byBloodGroup: patientBloodGroupQuery.rows.map(row => ({
        bloodGroup: row.blood_group,
        count: parseInt(row.count)
      }))
    }

    // 3. Staff Statistics
    const staffStatsQuery = await query(`
      SELECT 
        (SELECT COUNT(*) FROM doctors) as doctors,
        (SELECT COUNT(*) FROM users WHERE role = 'nurse' AND status IN ('active', 'inactive')) as nurses,
        (SELECT COUNT(*) FROM users WHERE role = 'lab_technician' AND status IN ('active', 'inactive')) as lab_technicians,
        (SELECT COUNT(*) FROM users WHERE role = 'pharmacist' AND status IN ('active', 'inactive')) as pharmacists
    `)

    const doctorSpecializationQuery = await query(`
      SELECT 
        d.specialization,
        COUNT(*) as count
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      WHERE u.status IN ('active', 'inactive')
      GROUP BY d.specialization
      ORDER BY count DESC
    `)

    const staffStats = {
      doctors: parseInt(staffStatsQuery.rows[0]?.doctors || '0'),
      nurses: parseInt(staffStatsQuery.rows[0]?.nurses || '0'),
      labTechnicians: parseInt(staffStatsQuery.rows[0]?.lab_technicians || '0'),
      pharmacists: parseInt(staffStatsQuery.rows[0]?.pharmacists || '0'),
      byDepartment: [],
      bySpecialization: doctorSpecializationQuery.rows.map(row => ({
        specialization: row.specialization || 'General Practice',
        count: parseInt(row.count)
      }))
    }

    // 4. Appointment Statistics
    const appointmentStatsQuery = await query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN DATE(appointment_date) = CURRENT_DATE THEN 1 END) as today,
        COUNT(CASE WHEN appointment_date >= CURRENT_DATE AND appointment_date < CURRENT_DATE + INTERVAL '7 days' THEN 1 END) as this_week,
        COUNT(CASE WHEN appointment_date >= DATE_TRUNC('month', CURRENT_DATE) THEN 1 END) as this_month,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status IN ('scheduled', 'confirmed') AND appointment_date >= NOW() THEN 1 END) as upcoming,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled
      FROM appointments
    `)

    const appointmentStats = appointmentStatsQuery.rows[0]
    const completionRate = appointmentStats.total > 0 
      ? Math.round((appointmentStats.completed / appointmentStats.total) * 100) 
      : 0

    // 5. Prescription Statistics
    const prescriptionStatsQuery = await query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN created_at >= DATE_TRUNC('month', CURRENT_DATE) THEN 1 END) as this_month,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active
      FROM prescriptions
    `)

    const topMedicationsQuery = await query(`
      SELECT 
        medication_name,
        COUNT(*) as count
      FROM prescriptions
      GROUP BY medication_name
      ORDER BY count DESC
      LIMIT 5
    `)

    const prescriptionStats = {
      total: parseInt(prescriptionStatsQuery.rows[0]?.total || '0'),
      thisMonth: parseInt(prescriptionStatsQuery.rows[0]?.this_month || '0'),
      active: parseInt(prescriptionStatsQuery.rows[0]?.active || '0'),
      topMedications: topMedicationsQuery.rows.map(row => ({
        name: row.medication_name || 'Unknown',
        count: parseInt(row.count || '0')
      }))
    }

    // 6. Lab Test Statistics
    const labTestStatsQuery = await query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN lt.created_at >= DATE_TRUNC('month', CURRENT_DATE) THEN 1 END) as this_month,
        COUNT(CASE WHEN lt.status IN ('ordered', 'in_progress') THEN 1 END) as pending,
        COUNT(CASE WHEN lt.status = 'completed' THEN 1 END) as completed
      FROM lab_tests lt
    `)

    const topLabTestsQuery = await query(`
      SELECT 
        test_name,
        COUNT(*) as count
      FROM lab_tests
      GROUP BY test_name
      ORDER BY count DESC
      LIMIT 5
    `)

    const labTestStats = {
      total: parseInt(labTestStatsQuery.rows[0]?.total || '0'),
      thisMonth: parseInt(labTestStatsQuery.rows[0]?.this_month || '0'),
      pending: parseInt(labTestStatsQuery.rows[0]?.pending || '0'),
      completed: parseInt(labTestStatsQuery.rows[0]?.completed || '0'),
      topTests: topLabTestsQuery.rows.map(row => ({
        name: row.test_name || 'Unknown',
        count: parseInt(row.count || '0')
      }))
    }

    // 7. Recent System Activity
    const recentActivityQuery = await query(`
      SELECT 
        'user' as type,
        'New user registered: ' || up.first_name || ' ' || up.last_name as description,
        u.created_at as timestamp,
        NULL as user
      FROM users u
      JOIN user_profiles up ON u.id = up.user_id
      WHERE u.created_at >= NOW() - INTERVAL '7 days'
      ORDER BY u.created_at DESC
      LIMIT 5
      
      UNION ALL
      
      SELECT 
        'appointment' as type,
        'Appointment: ' || up.first_name || ' ' || up.last_name || ' with Dr. ' || dup.first_name || ' ' || dup.last_name as description,
        a.created_at as timestamp,
        'Dr. ' || dup.first_name || ' ' || dup.last_name as user
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN user_profiles up ON p.user_id = up.user_id
      JOIN doctors d ON a.doctor_id = d.id
      JOIN user_profiles dup ON d.user_id = dup.user_id
      WHERE a.created_at >= NOW() - INTERVAL '7 days'
      ORDER BY a.created_at DESC
      LIMIT 5
      
      UNION ALL
      
      SELECT 
        'prescription' as type,
        'Prescribed ' || pr.medication_name || ' to ' || up.first_name || ' ' || up.last_name as description,
        pr.created_at as timestamp,
        'Dr. ' || dup.first_name || ' ' || dup.last_name as user
      FROM prescriptions pr
      JOIN patients p ON pr.patient_id = p.id
      JOIN user_profiles up ON p.user_id = up.user_id
      JOIN doctors d ON pr.doctor_id = d.id
      JOIN user_profiles dup ON d.user_id = dup.user_id
      WHERE pr.created_at >= NOW() - INTERVAL '7 days'
      ORDER BY pr.created_at DESC
      LIMIT 5
      
      ORDER BY timestamp DESC
      LIMIT 20
    `)

    const analyticsData = {
      systemOverview,
      patientStats,
      staffStats,
      appointmentStats: {
        total: parseInt(appointmentStats.total || '0'),
        today: parseInt(appointmentStats.today || '0'),
        thisWeek: parseInt(appointmentStats.this_week || '0'),
        thisMonth: parseInt(appointmentStats.this_month || '0'),
        completed: parseInt(appointmentStats.completed || '0'),
        upcoming: parseInt(appointmentStats.upcoming || '0'),
        cancelled: parseInt(appointmentStats.cancelled || '0'),
        completionRate
      },
      prescriptionStats,
      labTestStats,
      recentActivity: recentActivityQuery.rows || [],
      systemHealth: {
        averageAppointmentDuration: 30,
        patientSatisfaction: 95,
        staffUtilization: 78,
        systemUptime: 99.9
      }
    }

    console.log('Admin Analytics API: Successfully fetched system-wide data')

    return NextResponse.json({
      success: true,
      data: analyticsData
    })

  } catch (error) {
    console.error('Admin Analytics fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}

