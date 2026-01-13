# Scripturi SQL pentru Supabase

Acest director conține scripturile SQL necesare pentru configurarea bazei de date Supabase.

## Ordinea de execuție

1. **schema.sql** - Creează tabelele, indexurile, funcțiile și trigger-urile
2. **rls_policies.sql** - Configurează Row Level Security și politicile de acces
3. **seed_data.sql** - Inserează date de test (opțional)

## Cum să rulezi scripturile în Supabase

### Metoda 1: SQL Editor în Dashboard

1. Mergi pe [Supabase Dashboard](https://app.supabase.com)
2. Selectează proiectul tău
3. Mergi la **SQL Editor**
4. Copiază conținutul fiecărui fișier și rulează-l în ordine

### Metoda 2: Supabase CLI

```bash
# Instalează Supabase CLI (dacă nu este instalat)
npm install -g supabase

# Login
supabase login

# Link la proiect
supabase link --project-ref your-project-ref

# Rulează scripturile
supabase db push
```

## Structura bazei de date

### Tabela `users`
- `id` (UUID) - ID unic
- `username` (VARCHAR) - Numele de utilizator (unic)
- `password` (TEXT) - Parola codată în base64
- `role` (VARCHAR) - Rolul: 'member' sau 'admin'
- `full_name` (VARCHAR) - Numele complet
- `created_at`, `updated_at` - Timestamp-uri

### Tabela `events`
- `id` (UUID) - ID unic
- `title` (VARCHAR) - Titlul evenimentului
- `type` (VARCHAR) - Tipul: 'cununie', 'botez', 'majorat', 'nunta', 'altu'
- `location` (VARCHAR) - Locația
- `event_date` (DATE) - Data evenimentului
- `event_time` (TIME) - Ora evenimentului
- `created_by` (UUID) - ID-ul utilizatorului care a creat evenimentul
- `created_at`, `updated_at` - Timestamp-uri

## Date de test

După rularea `seed_data.sql`, vei avea:
- **Admin**: username: `admin`, parolă: `admin123`
- **Member**: username: `member`, parolă: `member123`

## Notă importantă

⚠️ **RLS Policies folosesc `auth.uid()`** - Aceasta funcționează doar dacă folosești autentificarea Supabase Auth. Pentru aplicația ta cu autentificare custom (username/password), va trebui să modificăm politicile RLS sau să folosim o altă abordare.

**Soluție**: Vom folosi o funcție helper care verifică utilizatorul autentificat prin sesiunea aplicației, nu prin Supabase Auth.

