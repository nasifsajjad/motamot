# Motamot — Opinion • মতামত

A modern, bilingual (English / বাংলা) opinion-sharing platform. Read opinions freely; sign in to post, comment, and vote.

**Live demo:** https://motamot.vercel.app  
**Stack:** Next.js 14 · Supabase · Tailwind CSS · Framer Motion · TypeScript

---

## ✨ Features

| Feature | Detail |
|---|---|
| 🌍 Bilingual | Full English & Bangla UI + content |
| 📖 Public reading | Browse & read without account |
| 🔐 Auth-gated writes | Post / comment / vote require sign-in |
| 🔄 Translation | Auto-translate via Google Translate API; save community translations |
| 🗳️ Voting | Upvote / downvote — anonymous to others, one per user |
| 🔥 Hot / ⭐ Featured | Hot = best of today; Featured = all-time top |
| 🛡️ Profanity filter | Server-side check, l33t-speak normalisation |
| 👮 Admin panel | Flag review, unpublish/delete, report management |
| 🔍 SEO | SSR, JSON-LD, Open Graph, sitemap, robots.txt |
| 💰 AdSense-ready | Configurable ad slot per post page |
| 🌙 Dark mode | Full light/dark theming |
| ♿ Accessible | Semantic HTML, ARIA, keyboard navigation |

---

## 🏁 Quick Start (Local)

### Prerequisites
- Node.js 20+
- A [Supabase](https://supabase.com) project (free tier)

### 1. Clone & install
```bash
git clone https://github.com/your-org/motamot.git
cd motamot
npm install
```

### 2. Configure environment
```bash
cp .env.example .env.local
```
Edit `.env.local` and fill in:
- `NEXT_PUBLIC_SUPABASE_URL` — from Supabase project settings
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from Supabase project settings
- `SUPABASE_SERVICE_ROLE_KEY` — from Supabase project settings (keep secret)
- `NEXT_PUBLIC_BASE_URL` — `http://localhost:3000` for local dev

All other variables are optional (translation API, AdSense, analytics).

### 3. Set up the database
In your Supabase SQL editor, run the full migration:
```
supabase/migrations/001_initial_schema.sql
```
Or use the Supabase CLI:
```bash
npx supabase db push
```

### 4. Configure Supabase Auth
In Supabase Dashboard → Authentication → Providers:
- Enable **Google** OAuth (add redirect URL: `http://localhost:3000/auth/callback`)
- Enable **Email** sign-in

### 5. Run
```bash
npm run dev
# → http://localhost:3000
```

---

## 🚀 Deploy to Vercel

### One-click
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-org/motamot)

### Manual
```bash
npm i -g vercel
vercel login
vercel --prod
```
Add all environment variables in Vercel → Settings → Environment Variables.

### Supabase Auth redirect
Add your Vercel URL to Supabase Auth → URL Configuration:
- **Site URL:** `https://your-app.vercel.app`
- **Redirect URLs:** `https://your-app.vercel.app/auth/callback`

---

## 🌐 Deploy to Cloudflare Pages (alternative)

```bash
npm run build
# Upload /out to Cloudflare Pages
# Use Cloudflare D1 or Supabase as DB
```

---

## 🧪 Tests

```bash
npm test             # run all unit tests
npm run test:watch   # watch mode
```

Tests cover:
- `tests/profanity.test.ts` — profanity detection, XSS sanitisation
- `tests/slug.test.ts` — slug generation, excerpt generation  
- `tests/rateLimit.test.ts` — rate limit logic

---

## 📁 Project Structure

```
src/
  app/                   Next.js App Router
    api/                 API routes
      posts/             CRUD, vote, translate, comments
      admin/             Moderation endpoints
      reports/           User reports
    posts/[slug]/        Post detail page (SSR + JSON-LD)
    admin/               Admin dashboard
    auth/callback/       OAuth callback
  components/
    layout/              Header, Footer
    post/                PostCard, PostList, VoteButtons,
                         TranslateToggle, CommentSection,
                         CreatePostModal
    AuthModal.tsx        Sign-in / sign-up modal
  hooks/
    useAuth.tsx          Auth context
    useLang.tsx          i18n context
  lib/
    supabase/            Client & server helpers
    profanity.ts         Profanity filter + XSS sanitiser
    rateLimit.ts         In-memory rate limiter
    slug.ts              Slug + excerpt generators
    translate.ts         Google Translate integration
    strings.ts           EN/BN UI string map
  types/index.ts         TypeScript interfaces
supabase/
  migrations/            SQL schema
tests/                   Unit tests
```

---

## ⚙️ Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key (server only) |
| `NEXT_PUBLIC_BASE_URL` | ✅ | Full base URL (no trailing slash) |
| `GOOGLE_TRANSLATE_API_KEY` | ⚡ | Google Cloud Translation API key |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | 💰 | `ca-pub-XXXX` for AdSense |
| `NEXT_PUBLIC_ADSENSE_SLOT` | 💰 | Ad slot ID |
| `CUSTOM_BLACKLIST` | 🛡️ | Comma-separated custom banned words |
| `BANGLA_BLACKLIST` | 🛡️ | Comma-separated Bangla banned words |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | 📊 | Google Analytics ID |
| `NEXT_PUBLIC_SENTRY_DSN` | 🐛 | Sentry error reporting DSN |

---

## 🛡️ Moderation

### Profanity blacklist
- Default English filter: `bad-words` npm package
- Custom words: set `CUSTOM_BLACKLIST=word1,word2` in env
- Bangla words: set `BANGLA_BLACKLIST=word1,word2` in env
- L33t-speak normalisation is applied before checking

### Admin panel
Visit `/admin` (requires `is_admin = true` in your user record).

To make a user admin, run in Supabase SQL editor:
```sql
update public.users set is_admin = true where email = 'your@email.com';
```

---

## 📝 API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/posts` | — | List posts (mode, page, limit, search) |
| POST | `/api/posts/create` | ✅ | Create post |
| GET | `/api/posts/:id/translate?target=bn` | — | Get/auto-translate |
| POST | `/api/posts/:id/translate` | ✅ | Save translation |
| POST | `/api/posts/:id/vote` | ✅ | Vote `{vote: 1\|-1\|0}` |
| GET | `/api/posts/:id/comments` | — | Get comments |
| POST | `/api/posts/:id/comments` | ✅ | Post comment |
| POST | `/api/reports` | ✅ | Report post/comment |
| GET | `/api/admin/flags` | 👮 | Admin: list flags & reports |
| PATCH | `/api/admin/flags` | 👮 | Admin: unpublish/delete/approve |
| GET | `/sitemap.xml` | — | XML sitemap |
| GET | `/robots.txt` | — | Robots file |

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Commit with conventional commits: `git commit -m "feat: add bookmark"`
4. Push and open a PR

---

## 📄 License

MIT — see [LICENSE](LICENSE)
