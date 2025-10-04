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

    // Verify user is an admin
    const userResult = await query(
      'SELECT role FROM users WHERE id = $1 AND status = $2',
      [userId, 'active']
    );

    if (userResult.rows.length === 0 || !['admin', 'super_admin'].includes(userResult.rows[0].role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Not an admin' },
        { status: 403 }
      );
    }

    // Get all patients with their detailed information
    const patientsResult = await query(
      `SELECT 
        p.id,
        p.user_id,
        up.date_of_birth,
        up.gender,
        p.blood_group,
        p.emergency_contact_name,
        p.emergency_contact_phone,
        up.address,
        p.created_at,
        u.email,
        u.status,
        up.first_name,
        up.last_name,
        up.phone
      FROM patients p
      INNER JOIN users u ON p.user_id = u.id
      LEFT JOIN user_profiles up ON p.user_id = up.user_id
      ORDER BY p.created_at DESC`
    );

    // Get appointment counts for each patient and parse address
    const patientsWithStats = await Promise.all(
      patientsResult.rows.map(async (patient) => {
        try {
          const appointmentResult = await query(
            'SELECT COUNT(*) as count FROM appointments WHERE patient_id = $1',
            [patient.id]
          );
          
          // Parse address JSONB if it exists
          let parsedAddress = {
            address: '',
            city: '',
            state: '',
            pincode: ''
          };
          
          if (patient.address) {
            try {
              // Check if it's already an object
              if (typeof patient.address === 'object') {
                parsedAddress = {
                  address: patient.address.street || '',
                  city: patient.address.city || '',
                  state: patient.address.state || '',
                  pincode: patient.address.pincode || ''
                };
              } else if (typeof patient.address === 'string') {
                // Try to parse as JSON
                try {
                  const addr = JSON.parse(patient.address);
                  parsedAddress = {
                    address: addr.street || '',
                    city: addr.city || '',
                    state: addr.state || '',
                    pincode: addr.pincode || ''
                  };
                } catch (jsonError) {
                  // If it's not valid JSON, treat it as plain text address
                  parsedAddress = {
                    address: patient.address,
                    city: '',
                    state: '',
                    pincode: ''
                  };
                }
              }
            } catch (e) {
              // Fallback: just use empty values
              console.log('Error handling address:', e);
            }
          }
          
          return {
            ...patient,
            ...parsedAddress,
            appointment_count: parseInt(appointmentResult.rows[0]?.count || '0')
          };
        } catch (error) {
          return {
            ...patient,
            address: '',
            city: '',
            state: '',
            pincode: '',
            appointment_count: 0
          };
        }
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        patients: patientsWithStats,
        total: patientsWithStats.length
      }
    });

  } catch (error) {
    console.error('Admin patients API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    // Verify user is an admin
    const userResult = await query(
      'SELECT role FROM users WHERE id = $1 AND status = $2',
      [userId, 'active']
    );

    if (userResult.rows.length === 0 || !['admin', 'super_admin'].includes(userResult.rows[0].role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Not an admin' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      email,
      password,
      first_name,
      last_name,
      phone,
      date_of_birth,
      gender,
      blood_group,
      emergency_contact_name,
      emergency_contact_phone,
      address,
      city,
      state,
      pincode
    } = body;

    // Validate required fields
    if (!email || !password || !first_name || !last_name || !phone || !date_of_birth || !gender) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Email already exists' },
        { status: 400 }
      );
    }

    // Create user account
    const userInsertResult = await query(
      `INSERT INTO users (email, password_hash, role, status, created_at)
       VALUES ($1, $2, 'patient', 'active', NOW())
       RETURNING id`,
      [email, password] // In production, hash the password!
    );

    const newUserId = userInsertResult.rows[0].id;

    // Prepare address JSONB
    const addressData = address || city || state || pincode ? {
      street: address || '',
      city: city || '',
      state: state || '',
      pincode: pincode || ''
    } : null;

    // Create user profile
    await query(
      `INSERT INTO user_profiles (user_id, first_name, last_name, phone, date_of_birth, gender, address)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [newUserId, first_name, last_name, phone, date_of_birth, gender, addressData ? JSON.stringify(addressData) : null]
    );

    // Create patient record
    const patientInsertResult = await query(
      `INSERT INTO patients (
        user_id, blood_group, 
        emergency_contact_name, emergency_contact_phone, created_at
      )
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING id`,
      [
        newUserId,
        blood_group || null,
        emergency_contact_name || null,
        emergency_contact_phone || null
      ]
    );

    return NextResponse.json({
      success: true,
      data: {
        patient_id: patientInsertResult.rows[0].id,
        user_id: newUserId,
        message: 'Patient created successfully'
      }
    });

  } catch (error) {
    console.error('Admin create patient API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

