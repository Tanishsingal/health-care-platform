# Testing Database-Driven Translations 🧪

## ✅ **SETUP COMPLETED**

The translation system is now active! Here's how to test it:

---

## 🚀 **STEP 1: RESTART YOUR DEV SERVER**

**Important:** You need to restart to pick up the new changes.

```bash
# Stop your current server (Ctrl+C)
# Then restart:
npm run dev
```

---

## 🧪 **STEP 2: TEST THE HOME PAGE**

1. **Visit:** `http://localhost:3000`

2. **What you'll see:**
   - The page should load normally
   - All translations should work (coming from database now!)
   - Try switching languages using the language switcher

3. **Behind the scenes:**
   - First load: Fetches translations from database
   - Cached for 5 minutes
   - Check browser DevTools Network tab → Look for `/api/translations?lang=en`

---

## 🎨 **STEP 3: TEST THE ADMIN UI**

1. **Login as admin:**
   - Visit: `http://localhost:3000/auth/login`
   - Email: `admin@hospital.com`
   - Password: `admin123`

2. **Visit translations management:**
   - Go to: `http://localhost:3000/admin/translations`
   - You should see the translation management interface

3. **Try editing a translation:**
   - Select a language (e.g., Hindi)
   - Find any translation (e.g., search for "welcome")
   - Click "Edit"
   - Change the text
   - Click "Save"
   - Go back to home page and switch to that language
   - You should see your change immediately!

---

## 🔍 **STEP 4: TEST ADDING A NEW TRANSLATION**

1. **In the admin translations page:**
   - Click "Add New" button
   
2. **Fill in the form:**
   - **Key:** `test.hello`
   - **Category:** `test`
   - **Value:** `Hello from Database!`
   - Click "Save Translation"

3. **Use it in code:**
   ```tsx
   const t = useTranslations('test')
   return <div>{t('hello')}</div>
   ```

---

## 🌐 **STEP 5: TEST LANGUAGE SWITCHING**

1. **On any page** (home, patient portal, etc.):
   - Click the language switcher (globe icon)
   - Switch to Hindi (हिन्दी)
   - Watch the page content change
   - Check DevTools Network tab:
     - First switch: API call to `/api/translations?lang=hi`
     - Subsequent loads: Served from cache (no API call)

---

## 📊 **STEP 6: VERIFY DATABASE**

You can check the database to see your translations:

```bash
# Connect to your database
# Check languages
SELECT * FROM languages;

# Check translation keys
SELECT * FROM translation_keys LIMIT 10;

# Check translations
SELECT 
  tk.key,
  l.native_name,
  t.value
FROM translations t
JOIN translation_keys tk ON t.key_id = tk.id
JOIN languages l ON t.language_code = l.code
WHERE tk.key = 'home.hero.title';

# Get all translations for a language
SELECT * FROM get_translations('hi') LIMIT 10;
```

---

## 🎯 **WHAT TO LOOK FOR:**

### **✅ SUCCESS INDICATORS:**

1. **Home page loads** without errors
2. **Language switcher works** smoothly
3. **Admin UI loads** at `/admin/translations`
4. **Can edit translations** through UI
5. **Changes appear immediately** (within 5 minutes due to cache)
6. **No console errors** in browser DevTools

### **❌ COMMON ISSUES:**

#### **Issue 1: Page shows translation keys instead of text**
**Example:** Shows `home.hero.title` instead of "National Health Portal"

**Solution:** 
- Check browser console for errors
- Verify API call succeeds: DevTools → Network → `/api/translations`
- Clear browser cache and reload

#### **Issue 2: Admin UI shows 403 Forbidden**
**Solution:**
- Make sure you're logged in as admin
- Email: `admin@hospital.com`, Password: `admin123`

#### **Issue 3: Changes not appearing**
**Solution:**
- Wait up to 5 minutes (cache duration)
- Or restart dev server to clear cache
- Check if API returned `"cached": true` (means using old cache)

#### **Issue 4: Database connection error**
**Solution:**
- Check your `.env` file has `DATABASE_URL`
- Verify database is running
- Check migration completed: `SELECT COUNT(*) FROM languages;` should return 7

---

## 🧪 **QUICK TEST SCRIPT**

Run this to verify everything works:

```bash
# 1. Check migration completed
node -e "const { Pool } = require('pg'); require('dotenv').config(); const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: false }); pool.query('SELECT COUNT(*) FROM languages').then(r => console.log('Languages:', r.rows[0].count)).finally(() => pool.end())"

# 2. Check translations exist
node -e "const { Pool } = require('pg'); require('dotenv').config(); const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: false }); pool.query('SELECT COUNT(*) FROM translations').then(r => console.log('Translations:', r.rows[0].count)).finally(() => pool.end())"
```

**Expected output:**
```
Languages: 7
Translations: 875  (125 keys × 7 languages)
```

---

## 📸 **VISUAL TESTING CHECKLIST**

Visit each page and verify translations work:

- [ ] **Home page** (`/`) - Hero section, features, schemes
- [ ] **Login page** (`/auth/login`) - Form labels, buttons
- [ ] **Register page** (`/auth/register`) - Form fields
- [ ] **Patient portal** (`/patient`) - Dashboard cards, welcome message
- [ ] **Admin translations** (`/admin/translations`) - Management UI

For each page:
- [ ] Switch language to Hindi
- [ ] Verify text changes
- [ ] Switch back to English
- [ ] No console errors

---

## 🎉 **SUCCESS!**

If all tests pass, you now have:

✅ **Database-driven translations** (not JSON files)
✅ **Admin UI** to manage translations
✅ **5-minute caching** for performance
✅ **Auto-fallback** to English
✅ **7 languages** supported
✅ **Instant updates** without redeployment

---

## 🆘 **NEED HELP?**

If something doesn't work:

1. **Check browser console** (F12 → Console tab)
2. **Check network requests** (F12 → Network tab)
3. **Check terminal** for server errors
4. **Verify migration** ran successfully
5. **Restart dev server**

---

## 📝 **NEXT STEPS:**

1. **Train admins** on the translation UI
2. **Remove old JSON files** (optional, after testing)
3. **Add more translations** through admin UI
4. **Export translations** as backup
5. **Celebrate!** 🎉

---

**The system is ready to test! Start with Step 1 (restart server) and work through the steps!** 🚀

