# Ghid de configurare Supabase pentru LaCantat

## Pasul 1: Creează proiectul Supabase

1. Mergi pe [https://app.supabase.com](https://app.supabase.com)
2. Creează un proiect nou
3. Notează **Project URL** și **anon key** din **Settings > API**

## Pasul 2: Configurează variabilele de mediu

Creează fișierul `.env` în root-ul proiectului:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Pasul 3: Rulează scripturile SQL

### 3.1. Schema bazei de date

1. Mergi la **SQL Editor** în Supabase Dashboard
2. Rulează conținutul din `supabase/schema_auth.sql`
   - Creează tabelele `user_profiles` și `events`
   - Creează funcții și trigger-uri

### 3.2. Row Level Security

1. Rulează conținutul din `supabase/rls_policies_auth.sql`
   - Configurează politicile de securitate

## Pasul 4: Configurează autentificarea

### 4.1. Setări Auth în Supabase

1. Mergi la **Authentication > Settings**
2. **Email Auth**: Activează "Enable Email Signup"
3. **Email Templates**: Poți personaliza template-urile (opțional)

### 4.2. Creează primul utilizator (admin)

#### Opțiunea 1: Prin Dashboard Supabase

1. Mergi la **Authentication > Users**
2. Click pe **Add User** > **Create new user**
3. Completează:
   - **Email**: admin@lacantat.ro (sau alt email)
   - **Password**: alege o parolă sigură
   - **Auto Confirm User**: ✅ (bifează pentru a nu necesita confirmare email)
4. Click **Create User**

#### Opțiunea 2: Prin aplicație (după ce rulezi aplicația)

1. Rulează aplicația: `npm run dev`
2. Mergi la `/login`
3. Folosește butonul "Sign Up" (dacă există) sau creează manual primul user

### 4.3. Setează rolul admin pentru primul utilizator

După crearea utilizatorului, rulează în SQL Editor:

```sql
-- Găsește ID-ul utilizatorului creat
SELECT id, email FROM auth.users WHERE email = 'admin@lacantat.ro';

-- Actualizează profilul cu rolul admin (înlocuiește USER_ID cu ID-ul real)
UPDATE public.user_profiles 
SET role = 'admin', username = 'admin'
WHERE id = 'USER_ID';
```

Sau mai simplu, dacă știi email-ul:

```sql
UPDATE public.user_profiles 
SET role = 'admin', username = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@lacantat.ro');
```

## Pasul 5: Testează aplicația

1. Rulează aplicația: `npm run dev`
2. Mergi la `http://localhost:5173/login`
3. Loghează-te cu email-ul și parola adminului creat
4. Ar trebui să vezi dashboard-ul cu opțiunea de a adăuga evenimente

## Structura bazei de date

### Tabela `user_profiles`
- Extinde `auth.users` (Supabase Auth)
- Conține: `username`, `role`, `full_name`
- Se creează automat când se creează un user în `auth.users`

### Tabela `events`
- Conține evenimentele (cantările)
- Câmpuri: `title`, `type`, `location`, `event_date`, `event_time`
- Legat de `auth.users` prin `created_by`

## Securitate (RLS)

- **Toți utilizatorii autentificați** pot vedea evenimentele
- **Doar adminii** pot crea/edita/șterge evenimente
- **Utilizatorii** pot actualiza propriul profil
- **Adminii** pot actualiza orice profil

## Notă importantă

⚠️ **Email vs Username**: Supabase Auth folosește email pentru autentificare. Username-ul este stocat în `user_profiles` și este folosit doar pentru afișare. Pentru login, folosește email-ul.

## Troubleshooting

### Eroare: "relation does not exist"
- Asigură-te că ai rulat `schema_auth.sql` înainte de `rls_policies_auth.sql`

### Eroare: "permission denied"
- Verifică că RLS policies au fost create corect
- Verifică că utilizatorul este autentificat

### Nu pot crea evenimente
- Verifică că utilizatorul are rolul `admin` în `user_profiles`
- Verifică că RLS policies permit adminilor să insereze în `events`

