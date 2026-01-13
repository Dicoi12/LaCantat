-- ============================================
-- Date inițiale pentru testare (folosind Supabase Auth)
-- ============================================
-- NOTĂ: Utilizatorii trebuie creați prin Supabase Auth Dashboard
-- sau prin aplicație folosind signUp()
-- 
-- După crearea utilizatorilor, actualizează profilele cu:
-- UPDATE public.user_profiles SET role = 'admin' WHERE username = 'admin';

-- Sau creează utilizatorii manual în Supabase Dashboard:
-- 1. Mergi la Authentication > Users
-- 2. Adaugă utilizator nou
-- 3. Email: admin@lacantat.ro, Password: admin123
-- 4. După creare, rulează:
--    UPDATE public.user_profiles SET role = 'admin', username = 'admin' WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@lacantat.ro');

