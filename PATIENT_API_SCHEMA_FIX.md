# Patient API Schema Fix

## Problem
The patient management API was failing with error:
```
column p.date_of_birth does not exist
```

## Root Cause
The API was querying columns from the wrong database tables. The schema has:
- **`user_profiles` table**: Contains `date_of_birth`, `gender`, `address` (as JSONB)
- **`patients` table**: Contains `blood_group`, `emergency_contact_name`, `emergency_contact_phone`

The API was incorrectly trying to select these fields from the `patients` table instead of `user_profiles`.

## Changes Made

### 1. Fixed GET /api/admin/patients (Line 41-113)
**Before:**
- Queried `p.date_of_birth`, `p.gender`, `p.address`, `p.city`, `p.state`, `p.pincode` from patients table

**After:**
- Changed to `up.date_of_birth`, `up.gender`, `up.address` from user_profiles table
- Added JSONB parsing for address field to extract city, state, pincode
- Properly handles address as structured JSON data

### 2. Fixed POST /api/admin/patients (Line 188-217)
**Before:**
- Inserted date_of_birth, gender, address, city, state, pincode into patients table
- Created separate columns for each address component

**After:**
- Inserts date_of_birth and gender into user_profiles table
- Creates address as JSONB object: `{ street, city, state, pincode }`
- Only inserts blood_group and emergency contacts into patients table

### 3. Fixed PUT /api/admin/patients/[id] (Line 78-121)
**Before:**
- Updated date_of_birth, gender in patients table
- Updated address fields as separate columns

**After:**
- Updates date_of_birth and gender in user_profiles table
- Creates address JSONB object for storage
- Only updates blood_group and emergency contacts in patients table

## Database Schema Structure

### user_profiles table
```sql
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    date_of_birth DATE,        -- ✅ HERE
    gender VARCHAR(20),         -- ✅ HERE
    phone VARCHAR(20),
    address JSONB,              -- ✅ HERE (stored as JSON)
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### patients table
```sql
CREATE TABLE patients (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    patient_id VARCHAR(50),
    blood_group VARCHAR(5),                    -- ✅ HERE
    height_cm INTEGER,
    weight_kg DECIMAL(5,2),
    allergies TEXT[],
    chronic_conditions TEXT[],
    emergency_contact_name VARCHAR(100),       -- ✅ HERE
    emergency_contact_phone VARCHAR(20),       -- ✅ HERE
    insurance_provider VARCHAR(100),
    insurance_policy_number VARCHAR(100),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## Address JSONB Format
```json
{
  "street": "123 Main Street",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001"
}
```

## Testing
After these fixes:
- ✅ GET endpoint fetches all patients successfully
- ✅ POST endpoint creates new patients with correct data placement
- ✅ PUT endpoint updates patient information in correct tables
- ✅ Address fields are properly parsed from JSONB
- ✅ No more "column does not exist" errors

## Impact
- Patient management API now works correctly
- Admin panel can view, add, edit, and export patients
- Data is stored in the correct database tables
- Address handling follows the database schema design

