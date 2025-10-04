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

    const patientId = params.id;
    const body = await request.json();
    const {
      first_name,
      last_name,
      phone,
      email,
      date_of_birth,
      gender,
      blood_group,
      emergency_contact_name,
      emergency_contact_phone,
      address,
      city,
      state,
      pincode,
      status
    } = body;

    // Get patient's user_id
    const patientResult = await query(
      'SELECT user_id FROM patients WHERE id = $1',
      [patientId]
    );

    if (patientResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Patient not found' },
        { status: 404 }
      );
    }

    const patientUserId = patientResult.rows[0].user_id;

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
      [first_name, last_name, phone, date_of_birth, gender, addressData ? JSON.stringify(addressData) : null, patientUserId]
    );

    // Update user email and status if provided
    if (email) {
      await query(
        'UPDATE users SET email = $1 WHERE id = $2',
        [email, patientUserId]
      );
    }

    if (status) {
      await query(
        'UPDATE users SET status = $1 WHERE id = $2',
        [status, patientUserId]
      );
    }

    // Update patient information
    await query(
      `UPDATE patients 
       SET blood_group = $1,
           emergency_contact_name = $2, emergency_contact_phone = $3
       WHERE id = $4`,
      [
        blood_group,
        emergency_contact_name,
        emergency_contact_phone,
        patientId
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Patient updated successfully'
    });

  } catch (error) {
    console.error('Admin update patient API error:', error);
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

    const patientId = params.id;

    // Get patient's user_id
    const patientResult = await query(
      'SELECT user_id FROM patients WHERE id = $1',
      [patientId]
    );

    if (patientResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Patient not found' },
        { status: 404 }
      );
    }

    const patientUserId = patientResult.rows[0].user_id;

    // Soft delete by updating user status to 'inactive'
    await query(
      'UPDATE users SET status = $1 WHERE id = $2',
      ['inactive', patientUserId]
    );

    return NextResponse.json({
      success: true,
      message: 'Patient deleted successfully'
    });

  } catch (error) {
    console.error('Admin delete patient API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

