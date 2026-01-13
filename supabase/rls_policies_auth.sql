-- ============================================
-- Row Level Security (RLS) Policies cu Supabase Auth
-- ============================================

-- Activează RLS pe tabele
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLITICI PENTRU TABELA USER_PROFILES
-- ============================================

-- Utilizatorii pot vedea toate profilele (pentru afișare membri)
CREATE POLICY "User profiles are viewable by authenticated users"
    ON public.user_profiles
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Utilizatorii pot actualiza propriul profil (dar nu rolul)
CREATE POLICY "Users can update own profile"
    ON public.user_profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id
        AND (
            -- Nu poate schimba rolul decât dacă este admin
            role = (SELECT role FROM public.user_profiles WHERE id = auth.uid())
            OR (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin'
        )
    );

-- Doar adminii pot crea profile noi (prin trigger se creează automat)
-- Adminii pot actualiza orice profil
CREATE POLICY "Admins can update any profile"
    ON public.user_profiles
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

-- ============================================
-- POLITICI PENTRU TABELA EVENTS
-- ============================================

-- Toți utilizatorii autentificați pot vedea evenimentele
CREATE POLICY "Events are viewable by authenticated users"
    ON public.events
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Doar adminii pot crea evenimente
CREATE POLICY "Only admins can insert events"
    ON public.events
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

-- Doar adminii pot actualiza evenimente
CREATE POLICY "Only admins can update events"
    ON public.events
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

-- Doar adminii pot șterge evenimente
CREATE POLICY "Only admins can delete events"
    ON public.events
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

