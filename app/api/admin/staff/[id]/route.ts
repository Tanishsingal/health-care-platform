import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { verifyToken } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const staffUserId = params.id;
    const body = await request.json();
    const {
      first_name,
      last_name,
      phone,
      email,
      date_of_birth,
      gender,
      address,
      city,
      state,
      pincode,
      status,
      role,
      // Doctor-specific fields
      specialization,
      department,
      license_number,
      consultation_fee
    } = body;

    // Verify staff member exists
    const staffResult = await query(
      'SELECT role FROM users WHERE id = $1',
      [staffUserId]
    );

    if (staffResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Staff member not found' },
        { status: 404 }
      );
    }

    const currentRole = staffResult.rows[0].role;

    // Prepare address JSONB
    const addressData = address || city || state || pincode ? {
      street: address || '',
      city: city || '',
      state: state || '',
      pincode: pincode || ''
    } : null;

    // Update user profile
    await query(
      `UPDATE user_profiles 
       SET first_name = $1, last_name = $2, phone = $3, date_of_birth = $4, gender = $5, address = $6
       WHERE user_id = $7`,
      [first_name, last_name, phone, date_of_birth, gender, addressData ? JSON.stringify(addressData) : null, staffUserId]
    );

    // Update user email if provided
    if (email) {
      await query(
        'UPDATE users SET email = $1 WHERE id = $2',
        [email, staffUserId]
      );
    }

    // Update user status if provided
    if (status) {
      await query(
        'UPDATE users SET status = $1 WHERE id = $2',
        [status, staffUserId]
      );
    }

    // Update doctor-specific information if role is doctor
    if (currentRole === 'doctor') {
      await query(
        `UPDATE doctors 
         SET specialization = $1, department = $2, license_number = $3, consultation_fee = $4
         WHERE user_id = $5`,
        [specialization, department, license_number, consultation_fee, staffUserId]
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Staff member updated successfully'
    });

  } catch (error) {
    console.error('Admin update staff API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const staffUserId = params.id;

    // Verify staff member exists
    const staffResult = await query(
      'SELECT id FROM users WHERE id = $1',
      [staffUserId]
    );

    if (staffResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Staff member not found' },
        { status: 404 }
      );
    }

    // Soft delete by updating user status to 'inactive'
    await query(
      'UPDATE users SET status = $1 WHERE id = $2',
      ['inactive', staffUserId]
    );

    return NextResponse.json({
      success: true,
      message: 'Staff member deleted successfully'
    });

  } catch (error) {
    console.error('Admin delete staff API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

