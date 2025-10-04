-- Create translations system for multi-language support
-- This replaces hardcoded JSON files with database-driven translations

-- 1. Create languages table
CREATE TABLE IF NOT EXISTS languages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(10) UNIQUE NOT NULL, -- 'en', 'hi', 'ta', etc.
  name VARCHAR(100) NOT NULL, -- 'English', 'Hindi', etc.
  native_name VARCHAR(100) NOT NULL, -- 'English', 'हिन्दी', etc.
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create translation keys table (stores the key structure)
CREATE TABLE IF NOT EXISTS translation_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(500) UNIQUE NOT NULL, -- 'home.hero.title', 'dashboard.patient.welcome', etc.
  category VARCHAR(100), -- 'home', 'dashboard', 'auth', etc.
  description TEXT, -- What this translation is for
  context TEXT, -- Where it's used
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create translations table (stores actual translations)
CREATE TABLE IF NOT EXISTS translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_id UUID NOT NULL REFERENCES translation_keys(id) ON DELETE CASCADE,
  language_code VARCHAR(10) NOT NULL REFERENCES languages(code) ON DELETE CASCADE,
  value TEXT NOT NULL, -- The actual translated text
  is_verified BOOLEAN DEFAULT false, -- Whether translation is verified by native speaker
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(key_id, language_code) -- One translation per key per language
);

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_translation_keys_key ON translation_keys(key);
CREATE INDEX IF NOT EXISTS idx_translation_keys_category ON translation_keys(category);
CREATE INDEX IF NOT EXISTS idx_translations_key_id ON translations(key_id);
CREATE INDEX IF NOT EXISTS idx_translations_language_code ON translations(language_code);
CREATE INDEX IF NOT EXISTS idx_translations_key_language ON translations(key_id, language_code);
CREATE INDEX IF NOT EXISTS idx_languages_code ON languages(code);
CREATE INDEX IF NOT EXISTS idx_languages_active ON languages(is_active);

-- 5. Insert supported languages
INSERT INTO languages (code, name, native_name, is_active, is_default) VALUES
  ('en', 'English', 'English', true, true),
  ('hi', 'Hindi', 'हिन्दी', true, false),
  ('ta', 'Tamil', 'தமிழ்', true, false),
  ('te', 'Telugu', 'తెలుగు', true, false),
  ('bn', 'Bengali', 'বাংলা', true, false),
  ('mr', 'Marathi', 'मराठी', true, false),
  ('gu', 'Gujarati', 'ગુજરાતી', true, false)
ON CONFLICT (code) DO NOTHING;

-- 6. Create a view for easy querying
CREATE OR REPLACE VIEW v_translations AS
SELECT 
  tk.key,
  tk.category,
  tk.description,
  t.language_code,
  t.value,
  t.is_verified,
  l.name as language_name,
  l.native_name as language_native_name
FROM translation_keys tk
LEFT JOIN translations t ON tk.id = t.key_id
LEFT JOIN languages l ON t.language_code = l.code
WHERE l.is_active = true;

-- 7. Create function to get translations for a language (with fallback to English)
CREATE OR REPLACE FUNCTION get_translations(lang_code VARCHAR)
RETURNS TABLE (
  key VARCHAR,
  value TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tk.key,
    COALESCE(
      (SELECT t.value FROM translations t WHERE t.key_id = tk.id AND t.language_code = lang_code LIMIT 1),
      (SELECT t.value FROM translations t WHERE t.key_id = tk.id AND t.language_code = 'en' LIMIT 1),
      tk.key -- Fallback to key itself if no translation exists
    ) as value
  FROM translation_keys tk;
END;
$$ LANGUAGE plpgsql;

-- 8. Create function to update or insert translation (upsert)
CREATE OR REPLACE FUNCTION upsert_translation(
  p_key VARCHAR,
  p_language_code VARCHAR,
  p_value TEXT,
  p_category VARCHAR DEFAULT NULL,
  p_description TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_key_id UUID;
  v_translation_id UUID;
BEGIN
  -- Insert or get key_id
  INSERT INTO translation_keys (key, category, description)
  VALUES (p_key, p_category, p_description)
  ON CONFLICT (key) 
  DO UPDATE SET 
    category = COALESCE(p_category, translation_keys.category),
    description = COALESCE(p_description, translation_keys.description),
    updated_at = CURRENT_TIMESTAMP
  RETURNING id INTO v_key_id;
  
  -- Insert or update translation
  INSERT INTO translations (key_id, language_code, value)
  VALUES (v_key_id, p_language_code, p_value)
  ON CONFLICT (key_id, language_code)
  DO UPDATE SET 
    value = p_value,
    updated_at = CURRENT_TIMESTAMP
  RETURNING id INTO v_translation_id;
  
  RETURN v_translation_id;
END;
$$ LANGUAGE plpgsql;

-- 9. Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_translation_keys_updated_at
  BEFORE UPDATE ON translation_keys
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_translations_updated_at
  BEFORE UPDATE ON translations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_languages_updated_at
  BEFORE UPDATE ON languages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 10. Grant necessary permissions
-- GRANT SELECT ON languages TO authenticated;
-- GRANT SELECT ON translation_keys TO authenticated;
-- GRANT SELECT ON translations TO authenticated;
-- GRANT SELECT ON v_translations TO authenticated;

COMMENT ON TABLE languages IS 'Supported languages in the application';
COMMENT ON TABLE translation_keys IS 'Translation key structure (e.g., home.hero.title)';
COMMENT ON TABLE translations IS 'Actual translations for each key in each language';
COMMENT ON FUNCTION get_translations IS 'Get all translations for a language with English fallback';
COMMENT ON FUNCTION upsert_translation IS 'Insert or update a translation';

