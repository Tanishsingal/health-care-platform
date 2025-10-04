import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get user info from auth token
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - No token' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    const userId = payload.userId;

    // Verify user is a nurse
    const userResult = await query(
      'SELECT role FROM users WHERE id = $1 AND status = $2',
      [userId, 'active']
    );

    if (userResult.rows.length === 0 || userResult.rows[0].role !== 'nurse') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Not a nurse' },
        { status: 403 }
      );
    }

    // Get nurse profile
    const nurseProfile = await query(
      `SELECT up.first_name, up.last_name, up.phone, u.email
       FROM user_profiles up
       INNER JOIN users u ON up.user_id = u.id
       WHERE up.user_id = $1`,
      [userId]
    );

    // Get today's appointments (if appointments table exists)
    let todayAppointments: any[] = [];
    try {
      const appointmentsResult = await query(
        `SELECT 
          a.id,
          a.appointment_date,
          a.duration_minutes,
          a.reason,
          a.status,
          p.id as patient_id,
          p.patient_id as medical_record_number,
          up.first_name as patient_first_name,
          up.last_name as patient_last_name,
          d.id as doctor_id,
          dup.first_name as doctor_first_name,
          dup.last_name as doctor_last_name
        FROM appointments a
        INNER JOIN patients p ON a.patient_id = p.id
        LEFT JOIN user_profiles up ON p.user_id = up.user_id
        LEFT JOIN doctors d ON a.doctor_id = d.id
        LEFT JOIN user_profiles dup ON d.user_id = dup.user_id
        WHERE DATE(a.appointment_date) = CURRENT_DATE
        AND a.status IN ('scheduled', 'confirmed', 'in_progress')
        ORDER BY a.appointment_date ASC`,
        []
      );
      todayAppointments = appointmentsResult.rows;
    } catch (error) {
      console.log('No appointments table found');
    }

    // Get all active patients (last 50)
    const assignedPatients = await query(
      `SELECT 
        p.id,
        p.user_id,
        p.patient_id as medical_record_number,
        p.blood_group,
        p.created_at,
        up.first_name,
        up.last_name,
        up.phone,
        up.date_of_birth
      FROM patients p
      INNER JOIN users u ON p.user_id = u.id
      LEFT JOIN user_profiles up ON p.user_id = up.user_id
      WHERE u.status = 'active'
      ORDER BY p.created_at DESC
      LIMIT 50`,
      []
    );

    // Get pending lab tests (tasks) for today
    let pendingTasks: any[] = [];
    try {
      const tasksResult = await query(
        `SELECT 
          lt.id,
          lt.test_type,
          lt.status,
          lt.ordered_date,
          p.patient_id as medical_record_number,
          up.first_name as patient_first_name,
          up.last_name as patient_last_name,
          d.id as doctor_id,
          dup.first_name as doctor_first_name,
          dup.last_name as doctor_last_name
        FROM lab_tests lt
        INNER JOIN patients p ON lt.patient_id = p.id
        LEFT JOIN user_profiles up ON p.user_id = up.user_id
        LEFT JOIN doctors d ON lt.doctor_id = d.id
        LEFT JOIN user_profiles dup ON d.user_id = dup.user_id
        WHERE lt.status IN ('ordered', 'in_progress')
        ORDER BY lt.ordered_date DESC
        LIMIT 20`,
        []
      );
      
      // Format tasks
      pendingTasks = tasksResult.rows.map(task => ({
        id: task.id,
        task: task.test_type === 'sample_collection' ? 'Collect Sample' : `Process ${task.test_type}`,
        patient: `${task.patient_first_name} ${task.patient_last_name}`,
        priority: task.status === 'ordered' ? 'High' : 'Medium',
        time: new Date(task.ordered_date).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        status: task.status,
        medical_record_number: task.medical_record_number
      }));
    } catch (error) {
      console.log('No lab tests table found');
    }

    // Get prescriptions that need to be administered
    try {
      const prescriptionsResult = await query(
        `SELECT 
          pr.id,
          pr.status,
          pr.created_at,
          p.patient_id as medical_record_number,
          up.first_name as patient_first_name,
          up.last_name as patient_last_name
        FROM prescriptions pr
        INNER JOIN patients p ON pr.patient_id = p.id
        LEFT JOIN user_profiles up ON p.user_id = up.user_id
        WHERE pr.status = 'pending'
        AND DATE(pr.created_at) = CURRENT_DATE
        ORDER BY pr.created_at ASC
        LIMIT 10`,
        []
      );
      
      // Add medication administration tasks
      const medicationTasks = prescriptionsResult.rows.map(prescription => ({
        id: `med-${prescription.id}`,
        task: 'Administer Medication',
        patient: `${prescription.patient_first_name} ${prescription.patient_last_name}`,
        priority: 'High',
        time: new Date(prescription.created_at).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        status: prescription.status,
        medical_record_number: prescription.medical_record_number
      }));
      
      pendingTasks = [...medicationTasks, ...pendingTasks];
    } catch (error) {
      console.log('No prescriptions table found');
    }

    // Count urgent alerts (high priority tasks in the next 2 hours)
    const urgentAlerts = pendingTasks.filter(task => task.priority === 'High').length;

    // Calculate statistics
    const stats = {
      assignedPatients: assignedPatients.rows.length,
      todayAppointments: todayAppointments.length,
      pendingTasks: pendingTasks.length,
      urgentAlerts: urgentAlerts
    };

    return NextResponse.json({
      success: true,
      data: {
        profile: nurseProfile.rows[0] || {},
        todayAppointments: todayAppointments,
        assignedPatients: assignedPatients.rows,
        pendingTasks: pendingTasks.slice(0, 10), // Limit to 10 most recent
        stats: stats
      }
    });

  } catch (error) {
    console.error('Nurse dashboard API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

