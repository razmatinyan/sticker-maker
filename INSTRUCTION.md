# INSTRUCTION.md

Developer and AI agent guide for working with the Stickr codebase. Covers structure, conventions, workflows, and how to extend the application correctly.

---

## Table of Contents

1. [Project Setup](#1-project-setup)
2. [Directory Structure](#2-directory-structure)
3. [Routing](#3-routing)
4. [Layouts](#4-layouts)
5. [Components](#5-components)
6. [Composables](#6-composables)
7. [State Management](#7-state-management)
8. [Data Fetching](#8-data-fetching)
9. [Server API Routes](#9-server-api-routes)
10. [Authentication](#10-authentication)
11. [Supabase Usage](#11-supabase-usage)
12. [Canvas Editor](#12-canvas-editor)
13. [Styling Guide](#13-styling-guide)
14. [Adding Features](#14-adding-features)
15. [Environment Variables](#15-environment-variables)
16. [Testing](#16-testing)
17. [Common Errors & Fixes](#17-common-errors--fixes)

---

## 1. Project Setup

```bash
npm install          # Install dependencies
npm run dev          # Start dev server at http://localhost:3000
npm run build        # Production build
npm run preview      # Preview production build
npx nuxi prepare     # Regenerate .nuxt/ types (fixes IDE errors)
```

After cloning, always run `npx nuxi prepare` first to generate TypeScript types for all Nuxt modules.

---

## 2. Directory Structure

```
stickr/
│
├── app/                         # All frontend code (Nuxt 4 app/ dir)
│   │
│   ├── assets/
│   │   └── css/
│   │       └── main.css         # Global styles, design tokens, component classes
│   │
│   ├── components/
│   │   ├── ui/                  # shadcn-vue components (auto-generated, don't edit)
│   │   ├── AppSidebar.vue       # Persistent sidebar navigation
│   │   ├── Editor/
│   │   │   ├── Toolbar.vue      # Left tool panel (upload, draw, text, AI, export)
│   │   │   ├── PropertiesPanel.vue  # Right panel (layer properties)
│   │   │   ├── ExportModal.vue  # Export dialog (PNG, WebP, Save to Library)
│   │   │   └── AiModal.vue      # AI generation dialog
│   │   └── Packs/
│   │       ├── NewModal.vue     # Create new pack dialog
│   │       └── PushToTelegramModal.vue  # Push pack to Telegram
│   │
│   ├── composables/             # Auto-imported reusable logic
│   │   ├── useAuth.ts           # signIn, signUp, signOut, getProfile
│   │   ├── useCanvas.ts         # Konva event handlers, image loading
│   │   ├── useExport.ts         # Export PNG/WebP, save to Supabase, ZIP
│   │   ├── useAiGeneration.ts   # Stability AI text-to-image
│   │   ├── useBackgroundRemoval.ts  # remove.bg integration
│   │   ├── useDashboard.ts      # Dashboard stats fetching
│   │   └── useAppToast.ts       # Sonner toast wrapper
│   │
│   ├── layouts/
│   │   ├── default.vue          # Sidebar + topbar (all authenticated pages)
│   │   ├── auth.vue             # Centered card (login, register)
│   │   └── editor.vue           # Full-screen editor (no topbar)
│   │
│   ├── middleware/
│   │   ├── auth.ts              # Redirects to /auth/login if not authenticated
│   │   └── guest.ts             # Redirects to /dashboard if already authenticated
│   │
│   ├── pages/
│   │   ├── index.vue            # Root redirect (→ /dashboard or /auth/login)
│   │   ├── dashboard.vue        # Stats + recent stickers + quick actions
│   │   ├── editor.vue           # Canvas editor (main feature)
│   │   ├── settings.vue         # Profile settings
│   │   ├── auth/
│   │   │   ├── login.vue
│   │   │   └── register.vue
│   │   ├── stickers/
│   │   │   └── index.vue        # Sticker library grid
│   │   ├── packs/
│   │   │   ├── index.vue        # All packs list
│   │   │   └── [id].vue         # Single pack view
│   │   └── telegram/
│   │       └── index.vue        # Telegram bot connect
│   │
│   ├── stores/
│   │   ├── useEditorStore.ts    # Canvas layers, undo/redo, tool state
│   │   └── useProfileStore.ts   # User profile cache
│   │
│   ├── types/
│   │   ├── database.types.ts    # Auto-generated from Supabase CLI
│   │   └── index.ts             # Convenience type exports
│   │
│   └── utils/
│       ├── auth.ts              # getUserId() — critical utility
│       └── time.ts              # useTimeOfDay()
│
├── server/
│   ├── api/
│   │   ├── ai-generate.post.ts
│   │   ├── remove-background.post.ts
│   │   └── telegram/
│   │       ├── verify-bot.post.ts
│   │       ├── create-pack.post.ts
│   │       └── add-to-pack.post.ts
│   ├── middleware/              # Runs on every request
│   └── utils/
│       └── supabase.ts          # Admin client (service key)
│
├── tests/
│   ├── setup.ts                 # Vitest global setup
│   ├── composables/             # Composable unit tests
│   ├── components/              # Component tests
│   ├── stores/                  # Pinia store tests
│   ├── server/                  # API route tests
│   └── e2e/                     # Playwright tests
│
├── public/
│   └── favicon.svg
│
├── nuxt.config.ts               # Framework + module configuration
├── tailwind.config.js           # Tailwind theme + content paths
├── vitest.config.ts             # Unit test configuration
├── playwright.config.ts         # E2E test configuration
├── .env                         # Local secrets (never commit)
├── .env.example                 # Safe template to commit
├── README.md                    # Project overview
├── CLAUDE.md                    # AI agent context + critical rules
└── INSTRUCTION.md               # This file
```

---

## 3. Routing

Nuxt 4 uses file-based routing from `app/pages/`:

```
app/pages/index.vue           → /
app/pages/dashboard.vue       → /dashboard
app/pages/editor.vue          → /editor
app/pages/stickers/index.vue  → /stickers
app/pages/packs/index.vue     → /packs
app/pages/packs/[id].vue      → /packs/:id
app/pages/auth/login.vue      → /auth/login
app/pages/auth/register.vue   → /auth/register
app/pages/telegram/index.vue  → /telegram
app/pages/settings.vue        → /settings
```

Every page must declare its layout and middleware at the top:

```vue
<script setup lang="ts">
definePageMeta({
  layout:     'default',    // 'default' | 'auth' | 'editor'
  middleware: 'auth',       // 'auth' | 'guest' | omit for public
})

useHead({ title: 'Page Title — Stickr' })
</script>
```

---

## 4. Layouts

Three layouts exist:

| Layout | File | Used By |
|---|---|---|
| `default` | `app/layouts/default.vue` | All authenticated pages |
| `auth` | `app/layouts/auth.vue` | Login, Register |
| `editor` | `app/layouts/editor.vue` | Canvas editor |

`default` includes `AppSidebar` (220px fixed left) + sticky topbar + main content area.
`editor` includes `AppSidebar` but no topbar — editor fills full height.
`auth` is a centered card on a black background with a blue glow effect.

---

## 5. Components

### Auto-Import

All components in `app/components/` are auto-imported by Nuxt. No import statements needed.

Naming convention maps folder structure to component name:

```
components/Editor/Toolbar.vue        → <EditorToolbar />
components/Packs/NewModal.vue        → <PacksNewModal />
components/ui/button/Button.vue      → <Button />
```

### shadcn-vue Components

Located in `app/components/ui/`. Never edit these directly.
Add new ones with:

```bash
npx shadcn-vue@latest add [component-name]
```

Currently installed: Button, Input, Avatar, Badge, Card, Dialog, DropdownMenu,
Label, Separator, Sheet, Skeleton, Sonner, Tabs, Tooltip, ScrollArea, Collapsible, Form.

### Icon Usage

All icons use Remix Icons via `@nuxt/icon`:

```vue
<Icon name="ri:icon-name-line" class="w-4 h-4" />
```

Browse icons at https://remixicon.com. Icon names format: `ri:name-line` or `ri:name-fill`.

---

## 6. Composables

All composables in `app/composables/` are auto-imported. Use them directly in `<script setup>`.

### useAuth

```ts
const { user, signIn, signUp, signOut, isAuthenticated } = useAuth()
```

### useAppToast

```ts
const { success, error, info, warning } = useAppToast()
success('Profile saved!')
error('Something went wrong')
```

### useDashboard

```ts
const { stats, recentStickers, isLoading, fetchDashboardData } = useDashboard()
```

### useExport

```ts
const { isExporting, progress, exportPackAsZip } = useExport()
```

### useAiGeneration

```ts
const { isGenerating, error, generateImage } = useAiGeneration()
const dataUrl = await generateImage('a cute cat wearing sunglasses')
```

### useBackgroundRemoval

```ts
const { isRemoving, error, removeBackground } = useBackgroundRemoval()
const resultDataUrl = await removeBackground(sourceDataUrl)
```

---

## 7. State Management

### Editor Store (`useEditorStore`)

The most complex store. Manages all canvas state:

```ts
const store = useEditorStore()

// State
store.layers          // Layer[]
store.selectedId      // string | null
store.activeTool      // 'select' | 'draw' | 'text' | 'eraser'
store.canvasSize      // { width: 512, height: 512 }
store.drawColor       // string (hex)
store.drawSize        // number (px)
store.textColor       // string (hex)
store.textSize        // number (px)

// Actions
store.addLayer(layer)
store.updateLayer(id, attrs)
store.removeLayer(id)
store.clearCanvas()
store.undo()
store.redo()

// Computed
store.canUndo         // boolean
store.canRedo         // boolean

// Image cache (never serialized to history)
store.imageCache      // Map<id, HTMLImageElement>
```

Layer types:

```ts
// Image layer
{
  id, type: 'image',
  x, y, width, height,
  draggable, imageEl,     // imageEl from imageCache
  scaleX, scaleY, rotation
}

// Text layer
{
  id, type: 'text',
  x, y, text, fontSize,
  fill, fontStyle, draggable,
  scaleX, scaleY, rotation
}

// Draw layer
{
  id, type: 'line',
  points, stroke, strokeWidth,
  lineCap, lineJoin, tension,
  globalCompositeOperation
}
```

### Profile Store (`useProfileStore`)

```ts
const profileStore = useProfileStore()
await profileStore.fetchProfile()
console.log(profileStore.profile)
```

---

## 8. Data Fetching

Always use the `watch(user, ...)` pattern — never `onMounted`:

```ts
const supabase = useSupabaseClient()
const user     = useSupabaseUser()
const data     = ref([])

watch(
  user,
  (u) => { if (u) fetchData() },
  { immediate: true }
)

async function fetchData() {
  const userId = getUserId(user.value)
  if (!userId) return

  const { data: result, error } = await supabase
    .from('stickers')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (!error) data.value = result ?? []
}
```

For parallel requests use `Promise.all`:

```ts
const [stickersRes, packsRes] = await Promise.all([
  supabase.from('stickers').select('*').eq('user_id', userId),
  supabase.from('sticker_packs').select('*').eq('user_id', userId),
])
```

---

## 9. Server API Routes

Located in `server/api/`. File name determines HTTP method:

```
server/api/stickers.get.ts         → GET  /api/stickers
server/api/stickers.post.ts        → POST /api/stickers
server/api/stickers/[id].delete.ts → DELETE /api/stickers/:id
```

Standard pattern:

```ts
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body   = await readBody(event)

  // Validate
  if (!body.required) {
    throw createError({ statusCode: 400, message: 'Required field missing' })
  }

  // Process
  try {
    const result = await doSomething(body, config.secretKey)
    return { ok: true, data: result }
  } catch (e: any) {
    throw createError({ statusCode: 500, message: e.message })
  }
})
```

Access secrets only in server routes:

```ts
const config = useRuntimeConfig()
config.stabilityApiKey    // ✅ server only
config.removeBgApiKey     // ✅ server only
config.supabaseServiceKey // ✅ server only
```

---

## 10. Authentication

### Route Protection

```ts
// Protect a page (requires login)
definePageMeta({ middleware: 'auth' })

// Guest only (redirect if logged in)
definePageMeta({ middleware: 'guest' })
```

### Checking Auth State

```ts
const user            = useSupabaseUser()
const isAuthenticated = computed(() => !!user.value)
```

### Getting User ID

```ts
import { getUserId } from '~/app/utils/auth'

const userId = getUserId(user.value)
if (!userId) throw new Error('Not authenticated')
```

**Why:** `@nuxtjs/supabase` v2 stores the ID in `sub` (JWT claim) on the client, not `id`. `getUserId()` handles both.

---

## 11. Supabase Usage

### Client-Side (in components/composables)

```ts
const supabase = useSupabaseClient()
const user     = useSupabaseUser()

// Query with RLS (user can only see their own data)
const { data } = await supabase
  .from('stickers')
  .select('*')
  .eq('user_id', getUserId(user.value))
```

### Server-Side (in server/api/ — bypasses RLS)

```ts
import { useSupabaseAdmin } from '~/server/utils/supabase'

const supabase = useSupabaseAdmin()

// Full access — no RLS
const { data } = await supabase
  .from('stickers')
  .select('*')
```

### Storage

```ts
// Upload
const { error } = await supabase.storage
  .from('stickers')
  .upload(`${userId}/${filename}`, blob, { contentType: 'image/png' })

// Get public URL
const { data } = supabase.storage
  .from('stickers')
  .getPublicUrl(`${userId}/${filename}`)

// Delete
await supabase.storage
  .from('stickers')
  .remove([`${userId}/${filename}`])
```

---

## 12. Canvas Editor

The editor (`app/pages/editor.vue`) is the most complex part of the app.

### Key Refs

```ts
const stageRef       = ref()   // vue-konva stage
const transformerRef = ref()   // vue-konva transformer
```

### Accessing the Stage

```ts
// Always use getNode() with vue-konva
const stage = stageRef.value?.getNode()
```

### Exporting Canvas

```ts
// Always hide transformer before export
function exportWithoutTransformer(callback: (stage: any) => void) {
  const stage       = stageRef.value?.getNode()
  const transformer = transformerRef.value?.getNode()

  const prev = transformer?.nodes() ?? []
  transformer?.nodes([])
  transformer?.getLayer()?.batchDraw()

  callback(stage)

  transformer?.nodes(prev)
  transformer?.getLayer()?.batchDraw()
}
```

### Layer Selection + Transformer

```ts
watch(() => store.selectedId, (newId) => {
  nextTick(() => {
    const transformer = transformerRef.value?.getNode()
    const stage       = stageRef.value?.getNode()
    const node        = newId ? stage?.findOne(`#${newId}`) : null

    transformer?.nodes(node ? [node] : [])
    transformer?.getLayer()?.batchDraw()
  })
})
```

### Adding a New Tool

1. Add tool ID to `ToolType` union in `useEditorStore.ts`
2. Add button to `app/components/Editor/Toolbar.vue`
3. Handle in `useCanvas.ts` composable
4. Add properties UI in `app/components/Editor/PropertiesPanel.vue`

---

## 13. Styling Guide

### Utility Classes

```css
/* Use these instead of raw Tailwind where possible */
.glass          /* Frosted glass panel */
.glass-card     /* Glass + elevation ring + rounded-xl */
.ring-framer    /* Blue Framer ring shadow */
.auth-glow      /* Radial blue glow (auth pages only) */
.sidebar        /* Sidebar shell (220px fixed) */
.editor-toolbar /* Vertical toolbar (64px fixed) */
.toolbar-btn    /* Tool button */
.toolbar-btn--active   /* Active state */
.properties-panel      /* Right panel */
.panel-label    /* Section label in properties */
.topbar         /* Sticky top bar */
```

### Colors

Always use Tailwind tokens, never hardcode:

```html
<!-- ✅ -->
<div class="bg-background text-foreground border-border" />
<div class="text-muted-foreground" />
<div class="text-framer-blue" />

<!-- ❌ -->
<div style="background: #000; color: #fff" />
```

### Typography

```html
<!-- Display heading -->
<h1 class="text-4xl font-medium tracking-display">Big Title</h1>

<!-- Section heading -->
<h2 class="text-2xl font-medium tracking-heading">Section</h2>

<!-- Body -->
<p class="text-sm text-muted-foreground">Description</p>

<!-- Section label -->
<p class="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
  Label
</p>
```

---

## 14. Adding Features

### Add a New Page

```bash
# 1. Create the page file
touch app/pages/my-feature.vue
```

```vue
<!-- 2. Page template -->
<script setup lang="ts">
definePageMeta({
  layout:     'default',
  middleware: 'auth',
})
useHead({ title: 'My Feature — Stickr' })
</script>

<template>
  <div class="max-w-5xl space-y-6">
    <h1 class="text-2xl font-medium tracking-heading">My Feature</h1>
  </div>
</template>
```

```ts
// 3. Add to sidebar navigation in AppSidebar.vue
{
  title: 'My Feature',
  icon:  'ri:star-line',
  href:  '/my-feature',
}
```

### Add a New API Route

```ts
// server/api/my-endpoint.post.ts
export default defineEventHandler(async (event) => {
  const body   = await readBody(event)
  const config = useRuntimeConfig()

  if (!body.requiredField) {
    throw createError({ statusCode: 400, message: 'requiredField is required' })
  }

  // Logic here
  return { ok: true }
})
```

### Add a New Database Table

1. Write migration SQL in Supabase SQL Editor
2. Enable RLS: `alter table public.my_table enable row level security;`
3. Add policies for select/insert/update/delete
4. Regenerate types: `npx supabase gen types typescript --project-id YOUR_ID > app/types/database.types.ts`
5. Add convenience type to `app/types/index.ts`

### Add a New Composable

```ts
// app/composables/useMyFeature.ts
export function useMyFeature() {
  const state     = ref<any[]>([])
  const isLoading = ref(false)

  async function fetchData() {
    // implementation
  }

  return { state, isLoading, fetchData }
}
```

No import needed — auto-imported everywhere.

---

## 15. Environment Variables

| Variable | Side | Required | Description |
|---|---|---|---|
| `NUXT_PUBLIC_SUPABASE_URL` | Client + Server | ✅ | Supabase project URL |
| `NUXT_PUBLIC_SUPABASE_ANON_KEY` | Client + Server | ✅ | Supabase anon key (Legacy) |
| `NUXT_SUPABASE_SERVICE_KEY` | Server only | ✅ | Supabase service key (Legacy) |
| `NUXT_STABILITY_API_KEY` | Server only | Optional | Stability AI key |
| `NUXT_REMOVE_BG_API_KEY` | Server only | Optional | remove.bg API key |
| `NUXT_TELEGRAM_BOT_TOKEN` | Server only | Optional | Default bot token |

`NUXT_PUBLIC_*` variables are safe to expose to the browser.
All others are server-only and never sent to the client.

---

## 16. Testing

### Unit Tests (Vitest)

```bash
npm run test           # Watch mode
npm run test -- --run  # Run once
npm run test:ui        # Visual UI
```

Test files live next to what they test or in `tests/`:

```
tests/stores/useEditorStore.test.ts
tests/composables/useAuth.test.ts
tests/utils/auth.test.ts
tests/server/api/ai-generate.test.ts
```

### E2E Tests (Playwright)

```bash
npm run test:e2e
```

Requires a running dev server or uses `webServer` config in `playwright.config.ts`.

Set test credentials in `.env`:

```env
TEST_EMAIL=test@example.com
TEST_PASSWORD=testpassword123
```

---

## 17. Common Errors & Fixes

| Error | Cause | Fix |
|---|---|---|
| `user.value.id` is undefined | `@nuxtjs/supabase` v2 uses `sub` not `id` | Use `getUserId(user.value)` |
| Hydration mismatch on styles | Inline `style` differs server/client | Move to CSS class |
| `Cannot read properties of undefined (reading 'state')` | Pinia + Nuxt 4 compat | Add `storesDirs` to `nuxt.config.ts` |
| `window is not defined` | Browser API during SSR | Wrap in `if (import.meta.client)` or `onMounted` |
| Konva `Can not find parent node` | Transformer in separate `v-layer` | Put transformer in same `v-layer` as content |
| `getStage()` returns undefined | Wrong vue-konva method | Use `getNode()` instead |
| Canvas preview empty in modal | Async timing issue | Generate preview synchronously before opening modal |
| Transformer shows in exports | Not hidden before `toDataURL()` | Use `exportWithoutTransformer()` helper |
| `Icon failed to load` | Wrong icon name | Verify at https://remixicon.com |
| `shadcn` type error in nuxt.config | Types not generated yet | Run `npx nuxi prepare` |
| Slow performance in Docker on Windows | WSL2 file system crossing | Move project into WSL2 filesystem |