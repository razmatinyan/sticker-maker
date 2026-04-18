# Stickr

> Create, export, and share stickers. Upload images, draw from scratch, or generate with AI. Export anywhere — including directly to your Telegram sticker packs.

![Stickr](https://img.shields.io/badge/Nuxt-4-00DC82?style=flat&logo=nuxt.js)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=flat&logo=supabase)
![Vue](https://img.shields.io/badge/Vue-3-4FC08D?style=flat&logo=vue.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript)

---

## Features

- **Canvas Editor** — Upload images, draw freehand, add text with full styling controls
- **AI Generation** — Generate stickers from text prompts via Stability AI
- **Background Removal** — One-click background removal via remove.bg
- **Export** — Download as PNG or WebP, or save to your personal library
- **Sticker Packs** — Group stickers into packs, export as ZIP
- **Telegram Integration** — Connect your Telegram bot and push packs directly to Telegram
- **Anonymous Use** — Create and download stickers without an account
- **Authentication** — Email/password auth via Supabase with persistent library

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Nuxt 4 (compatibilityVersion: 4) |
| Language | TypeScript |
| UI Components | shadcn-vue |
| Styling | Tailwind CSS |
| Icons | Remix Icons via @nuxt/icon |
| Font | Geist via @nuxtjs/fonts |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| File Storage | Supabase Storage |
| Canvas | Konva + vue-konva |
| State | Pinia |
| Notifications | vue-sonner |
| AI Generation | Stability AI (SDXL) |
| Background Removal | remove.bg API |
| Testing | Vitest + Playwright |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Supabase account
- Stability AI API key (optional — for AI generation)
- remove.bg API key (optional — for background removal)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/stickr.git
cd stickr

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
```

### Environment Variables

Fill in your `.env` file:

```env
# Supabase
NUXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NUXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
NUXT_SUPABASE_SERVICE_KEY=eyJhbGc...

# AI & Services (optional)
NUXT_STABILITY_API_KEY=sk-...
NUXT_REMOVE_BG_API_KEY=...
NUXT_TELEGRAM_BOT_TOKEN=...
```

> Use the **Legacy** anon and service_role keys from Supabase — not the new Publishable/Secret keys.

### Database Setup

Run the SQL scripts in order in your Supabase SQL Editor:

1. `docs/sql/01-schema.sql` — tables and triggers
2. `docs/sql/02-rls.sql` — row level security policies
3. `docs/sql/03-storage.sql` — storage bucket policies

### Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

---

## Project Structure

```
stickr/
├── app/
│   ├── assets/css/          # Global styles + design tokens
│   ├── components/
│   │   ├── ui/              # shadcn-vue components
│   │   ├── Editor/          # Canvas editor components
│   │   └── Packs/           # Pack manager components
│   ├── composables/         # Reusable logic
│   ├── layouts/             # Page layouts
│   ├── middleware/          # Route guards
│   ├── pages/               # File-based routes
│   ├── stores/              # Pinia stores
│   ├── types/               # TypeScript types
│   └── utils/               # Helper functions
├── server/
│   ├── api/                 # Nitro API routes
│   │   └── telegram/        # Telegram bot endpoints
│   ├── middleware/          # Server middleware
│   └── utils/               # Server utilities
├── tests/
│   ├── composables/         # Composable unit tests
│   ├── components/          # Component tests
│   ├── stores/              # Store tests
│   ├── server/              # API route tests
│   └── e2e/                 # Playwright end-to-end tests
└── public/                  # Static assets
```

---

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run unit tests (Vitest)
npm run test:ui      # Run tests with UI
npm run test:e2e     # Run E2E tests (Playwright)
npm run test:all     # Run all tests
```

---

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import repo on [vercel.com](https://vercel.com)
3. Add all environment variables
4. Deploy

### Supabase Auth Configuration

After deploying, update in Supabase → Authentication → URL Configuration:

```
Site URL:      https://your-app.vercel.app
Redirect URLs: https://your-app.vercel.app/**
```

---

## API Routes

| Method | Route | Description | Auth |
|---|---|---|---|
| POST | `/api/ai-generate` | Generate image from prompt | Optional |
| POST | `/api/remove-background` | Remove image background | Optional |
| POST | `/api/telegram/verify-bot` | Validate bot token | Required |
| POST | `/api/telegram/create-pack` | Create Telegram sticker set | Required |
| POST | `/api/telegram/add-to-pack` | Add sticker to existing set | Required |

---

## Database Schema

```
profiles          — User profiles (auto-created on signup)
sticker_packs     — Sticker pack groups
stickers          — Individual stickers
templates         — Pre-made templates (admin-managed)
```

---

## License

MIT