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

    // Get all doctors with their details
    const doctorsResult = await query(
      `SELECT 
        d.id,
        d.user_id,
        d.specialization,
        d.department,
        d.license_number,
        d.consultation_fee,
        d.created_at,
        u.email,
        u.status,
        up.first_name,
        up.last_name,
        up.phone,
        up.date_of_birth,
        up.gender,
        up.address,
        'doctor' as role
      FROM doctors d
      INNER JOIN users u ON d.user_id = u.id
      LEFT JOIN user_profiles up ON d.user_id = up.user_id
      WHERE u.status IN ('active', 'inactive')
      ORDER BY d.created_at DESC`
    );

    // Get all nurses
    const nursesResult = await query(
      `SELECT 
        u.id,
        u.id as user_id,
        u.email,
        u.status,
        up.first_name,
        up.last_name,
        up.phone,
        up.date_of_birth,
        up.gender,
        up.address,
        u.created_at,
        'nurse' as role
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.role = 'nurse' AND u.status IN ('active', 'inactive')
      ORDER BY u.created_at DESC`
    );

    // Get all lab technicians
    const labTechsResult = await query(
      `SELECT 
        u.id,
        u.id as user_id,
        u.email,
        u.status,
        up.first_name,
        up.last_name,
        up.phone,
        up.date_of_birth,
        up.gender,
        up.address,
        u.created_at,
        'lab_technician' as role
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.role = 'lab_technician' AND u.status IN ('active', 'inactive')
      ORDER BY u.created_at DESC`
    );

    // Get all pharmacists
    const pharmacistsResult = await query(
      `SELECT 
        u.id,
        u.id as user_id,
        u.email,
        u.status,
        up.first_name,
        up.last_name,
        up.phone,
        up.date_of_birth,
        up.gender,
        up.address,
        u.created_at,
        'pharmacist' as role
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.role = 'pharmacist' AND u.status IN ('active', 'inactive')
      ORDER BY u.created_at DESC`
    );

    // Parse address for all staff
    const parseAddress = (addressField: any) => {
      let parsedAddress = {
        address: '',
        city: '',
        state: '',
        pincode: ''
      };
      
      if (addressField) {
        try {
          // Check if it's already an object
          if (typeof addressField === 'object') {
            parsedAddress = {
              address: addressField.street || '',
              city: addressField.city || '',
              state: addressField.state || '',
              pincode: addressField.pincode || ''
            };
          } else if (typeof addressField === 'string') {
            // Try to parse as JSON
            try {
              const addr = JSON.parse(addressField);
              parsedAddress = {
                address: addr.street || '',
                city: addr.city || '',
                state: addr.state || '',
                pincode: addr.pincode || ''
              };
            } catch (jsonError) {
              // If it's not valid JSON, treat it as plain text address
              parsedAddress = {
                address: addressField,
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
      
      return parsedAddress;
    };

    // Combine all staff with parsed addresses
    const allStaff = [
      ...doctorsResult.rows.map(staff => ({
        ...staff,
        ...parseAddress(staff.address)
      })),
      ...nursesResult.rows.map(staff => ({
        ...staff,
        ...parseAddress(staff.address)
      })),
      ...labTechsResult.rows.map(staff => ({
        ...staff,
        ...parseAddress(staff.address)
      })),
      ...pharmacistsResult.rows.map(staff => ({
        ...staff,
        ...parseAddress(staff.address)
      }))
    ];

    // Sort by created_at
    allStaff.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json({
      success: true,
      data: {
        staff: allStaff,
        total: allStaff.length
      }
    });

  } catch (error) {
    console.error('Admin staff API error:', error);
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
      role,
      address,
      city,
      state,
      pincode,
      // Doctor-specific fields
      specialization,
      department,
      license_number,
      consultation_fee
    } = body;

    // Validate required fields
    if (!email || !password || !first_name || !last_name || !phone || !role) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['doctor', 'nurse', 'lab_technician', 'pharmacist'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role' },
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
       VALUES ($1, $2, $3, 'active', NOW())
       RETURNING id`,
      [email, password, role] // In production, hash the password!
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
      [newUserId, first_name, last_name, phone, date_of_birth || null, gender || null, addressData ? JSON.stringify(addressData) : null]
    );

    // Create role-specific record if doctor
    if (role === 'doctor') {
      if (!specialization || !license_number) {
        return NextResponse.json(
          { success: false, error: 'Doctors require specialization and license number' },
          { status: 400 }
        );
      }

      // Generate doctor_id
      const doctorIdResult = await query(
        'SELECT COUNT(*) as count FROM doctors'
      );
      const doctorCount = parseInt(doctorIdResult.rows[0].count) + 1;
      const doctorId = `DOC${String(doctorCount).padStart(5, '0')}`;

      await query(
        `INSERT INTO doctors (
          user_id, doctor_id, specialization, department, license_number, consultation_fee, created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [newUserId, doctorId, specialization, department || null, license_number, consultation_fee || null]
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        user_id: newUserId,
        role: role,
        message: 'Staff member created successfully'
      }
    });

  } catch (error) {
    console.error('Admin create staff API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

