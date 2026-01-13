# LaCantat

Aplicație Vue 3 + TypeScript + Vite pentru gestionarea evenimentelor unei formații muzicale, cu integrare Supabase Auth.

## Funcționalități

- ✅ Autentificare cu Supabase Auth (email/password)
- ✅ Roluri: Admin și Member
- ✅ Dashboard cu următorul eveniment
- ✅ Gestionare evenimente (cantări): cununie, botez, majorat, nunta, altul
- ✅ Doar adminii pot adăuga/modifica/șterge evenimente
- ✅ Toți utilizatorii pot vedea evenimentele

## Configurare rapidă

### 1. Instalează dependențele

```bash
npm install
```

### 2. Configurează Supabase

Vezi ghidul detaliat în [`supabase/SETUP.md`](./supabase/SETUP.md)

**Rezumat:**
1. Creează proiect pe [Supabase](https://app.supabase.com)
2. Obține URL și anon key din **Settings > API**
3. Creează `.env` cu:
   ```env
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
4. Rulează scripturile SQL din `supabase/` în SQL Editor:
   - `schema_auth.sql` (mai întâi)
   - `rls_policies_auth.sql` (apoi)
5. Creează primul utilizator admin (vezi `supabase/SETUP.md`)

### 3. Rulează aplicația

```bash
npm run dev
```

## Structura proiectului

```
src/
├── components/       # Componente Vue reutilizabile
│   └── EventForm.vue # Formular pentru evenimente
├── composables/     # Composables Vue
│   ├── useAuth.ts   # Gestionare autentificare
│   ├── useEvents.ts # Gestionare evenimente
│   └── useSupabase.ts
├── lib/             # Biblioteci și configurații
│   └── supabase.ts  # Client Supabase
├── services/        # Servicii business logic
│   └── authService.ts
├── views/          # Vederi/pagini
│   ├── LoginView.vue
│   └── DashboardView.vue
└── router.ts       # Configurare rute
```

## Scripturi SQL

Toate scripturile SQL se găsesc în `supabase/`:

- `schema_auth.sql` - Schema bazei de date cu Supabase Auth
- `rls_policies_auth.sql` - Politici de securitate (RLS)
- `SETUP.md` - Ghid detaliat de configurare

## Tehnologii

- **Vue 3** - Framework UI
- **TypeScript** - Type safety
- **Vite** - Build tool
- **PrimeVue** - Component library
- **Supabase** - Backend (Auth + Database)
- **Vue Router** - Routing

## Development

```bash
# Development server
npm run dev

# Build pentru producție
npm run build

# Preview build-ul
npm run preview
```

## Deployment pe Vercel

### Configurare automată

1. **Conectează repository-ul la Vercel:**
   - Mergi pe [Vercel](https://vercel.com)
   - Click pe "Add New Project"
   - Selectează repository-ul GitHub/GitLab
   - Vercel va detecta automat configurația Vue.js

2. **Variabile de mediu:**
   - Adaugă în Vercel Dashboard > Settings > Environment Variables:
     - `VITE_SUPABASE_URL` - URL-ul proiectului Supabase
     - `VITE_SUPABASE_ANON_KEY` - Cheia anonă din Supabase

3. **Build Settings:**
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

4. **Deploy:**
   - Vercel va face deploy automat la fiecare push pe branch-ul principal
   - Fișierul `vercel.json` este deja configurat pentru a gestiona corect refresh-urile pe rute

### Configurare manuală

Dacă preferi să deploy-ezi manual:

```bash
# Instalează Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy pentru producție
vercel --prod
```

**Notă:** Asigură-te că ai setat variabilele de mediu în Vercel Dashboard sau folosește `vercel env add` pentru a le adăuga.
