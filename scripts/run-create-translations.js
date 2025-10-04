/**
 * Migration Script: Create Translations System
 * 
 * This script creates a database-driven translation system
 * to replace hardcoded JSON files with dynamic translations
 * that can be managed through the admin panel.
 */

const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

async function runMigration() {
  console.log('🚀 Starting translations system migration...\n')

  try {
    // Read SQL file
    const sqlPath = path.join(__dirname, 'create-translations-table.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')

    console.log('📋 Executing SQL migration...')
    await pool.query(sql)

    console.log('✅ Translations tables created successfully!\n')

    // Now migrate existing JSON translations to database
    console.log('📦 Migrating JSON translations to database...\n')
    await migrateJsonTranslations()

    console.log('\n✅ Migration completed successfully!')
    console.log('\n📊 Summary:')
    console.log('   ✓ Languages table created')
    console.log('   ✓ Translation keys table created')
    console.log('   ✓ Translations table created')
    console.log('   ✓ Indexes created for performance')
    console.log('   ✓ Helper functions created')
    console.log('   ✓ JSON translations migrated to database')
    console.log('\n🎉 You can now manage translations through the admin panel!')

  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    console.error(error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

/**
 * Migrate existing JSON translation files to database
 */
async function migrateJsonTranslations() {
  const messagesDir = path.join(__dirname, '..', 'messages')
  const languages = ['en', 'hi', 'ta', 'te', 'bn', 'mr', 'gu']

  // Read English translations as the source of keys
  const enPath = path.join(messagesDir, 'en.json')
  const enTranslations = JSON.parse(fs.readFileSync(enPath, 'utf8'))

  // Flatten nested JSON to dot notation
  const flattenedKeys = flattenObject(enTranslations)
  
  console.log(`   Found ${Object.keys(flattenedKeys).length} translation keys`)

  // Insert all keys and translations
  let insertedCount = 0
  let errorCount = 0

  for (const [key, value] of Object.entries(flattenedKeys)) {
    try {
      // Determine category from key (e.g., 'home.hero.title' -> 'home')
      const category = key.split('.')[0]

      // Insert key if not exists
      await pool.query(`
        INSERT INTO translation_keys (key, category)
        VALUES ($1, $2)
        ON CONFLICT (key) DO NOTHING
      `, [key, category])

      // Insert translations for all languages
      for (const lang of languages) {
        const langPath = path.join(messagesDir, `${lang}.json`)
        if (fs.existsSync(langPath)) {
          const langTranslations = JSON.parse(fs.readFileSync(langPath, 'utf8'))
          const flattenedLang = flattenObject(langTranslations)
          const translatedValue = flattenedLang[key] || value // Fallback to English

          await pool.query(`
            SELECT upsert_translation($1, $2, $3, $4, NULL)
          `, [key, lang, translatedValue, category])
        }
      }

      insertedCount++
      if (insertedCount % 20 === 0) {
        process.stdout.write(`   Migrated ${insertedCount} keys...\r`)
      }
    } catch (error) {
      console.error(`   ❌ Error migrating key "${key}":`, error.message)
      errorCount++
    }
  }

  console.log(`   ✅ Migrated ${insertedCount} translation keys`)
  if (errorCount > 0) {
    console.log(`   ⚠️  ${errorCount} errors occurred`)
  }
}

/**
 * Flatten nested object to dot notation
 * e.g., { home: { hero: { title: 'Hello' } } } -> { 'home.hero.title': 'Hello' }
 */
function flattenObject(obj, prefix = '') {
  const flattened = {}

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(flattened, flattenObject(value, newKey))
    } else {
      flattened[newKey] = value
    }
  }

  return flattened
}

// Run migration
runMigration()

