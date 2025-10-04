const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env' });

async function addPerformanceIndexes() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔗 Connecting to database...');
    await client.connect();
    console.log('✅ Connected successfully');

    // Read the SQL file
    const sqlPath = path.join(__dirname, 'add-performance-indexes.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📊 Adding performance indexes...');
    await client.query(sql);
    
    console.log('✅ All indexes created successfully!');
    console.log('');
    console.log('📈 Performance improvements:');
    console.log('   - Faster user queries by role and status');
    console.log('   - Improved patient and doctor lookups');
    console.log('   - Faster appointment and prescription queries');
    console.log('   - Better notification filtering');
    console.log('   - Optimized blog searches');
    console.log('');
    console.log('🚀 Your queries should be much faster now!');

  } catch (error) {
    console.error('❌ Error adding indexes:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

addPerformanceIndexes();

