# CLAUDE.md

This file provides essential context for AI agents (Claude, Cursor, Copilot, etc.) working on the Stickr codebase. Read this before making any changes.

---

## Project Identity

**Stickr** is a full-stack web application for creating, exporting, and sharing stickers. Built with Nuxt 4, Vue 3, TypeScript, Supabase, and shadcn-vue.

---

## Critical Rules — Read Before Touching Any Code

### 1. User ID — Never Use `user.value.id` Directly

`@nuxtjs/supabase` v2+ stores the user ID in `sub` on the client, not `id`. Always use the utility:

```ts
// ✅ CORRECT — always
import { getUserId } from '~/app/utils/auth'
const userId = getUserId(user.value)
if (!userId) throw new Error('Not authenticated')

// ❌ WRONG — silently returns undefined on client
const userId = user.value?.id
```

### 2. Server-Only Secrets

Never access these on the client side:

```ts
// ✅ Server-side only (server/api/*.ts)
const config = useRuntimeConfig()
config.supabaseServiceKey    // OK in server/
config.stabilityApiKey       // OK in server/
config.removeBgApiKey        // OK in server/
config.telegramBotToken      // OK in server/

// ✅ Safe on client (public.* prefix)
config.public.supabaseUrl
config.public.supabaseAnonKey
```

### 3. Canvas / Konva is Client-Only

Everything related to Konva must be wrapped in `<ClientOnly>` or guarded with `import.meta.client`:

```ts
// ✅ Correct
onMounted(async () => {
  const { default: Konva } = await import('konva')
})

// ❌ Will crash SSR
import Konva from 'konva'
```

### 4. Supabase Stage Reference

Access the Konva stage via `getNode()`, not `getStage()`:

```ts
// ✅ Correct with vue-konva
const stage = stageRef.value?.getNode()

// ❌ Wrong
const stage = stageRef.value?.getStage()
```

### 5. Dark Mode

The app is always dark. The `dark` class is set on `<html>` in `app/app.vue`. Never add light mode variants unless explicitly requested.

### 6. No Direct `localStorage` Usage

SSR will crash. Use Nuxt's SSR-safe alternatives:

```ts
// ✅ SSR-safe
const theme = useCookie('theme')

// ❌ Crashes SSR
localStorage.getItem('theme')
```

---

## Architecture Overview

```
Browser Request
    → Nuxt SSR (server renders page)
        → Supabase Auth (session from cookie)
            → Page Component (app/pages/)
                → Layout (app/layouts/)
                    → Components (app/components/)
                        → Pinia Store (app/stores/)

API Calls (from Vue components)
    → Nuxt Server Route (server/api/)
        → External APIs (Stability, remove.bg, Telegram)
        → Supabase (via service key — full access)
```

---

## Key Files Map

| File | Purpose |
|---|---|
| `app/app.vue` | Root — sets dark class, mounts Toaster |
| `app/layouts/default.vue` | Main layout with sidebar |
| `app/layouts/auth.vue` | Centered layout for login/register |
| `app/layouts/editor.vue` | Full-screen editor layout |
| `app/pages/editor.vue` | Canvas editor — most complex page |
| `app/stores/useEditorStore.ts` | All canvas state + undo/redo history |
| `app/composables/useCanvas.ts` | Konva event handlers + image loading |
| `app/composables/useExport.ts` | Export to PNG/WebP/ZIP + Supabase upload |
| `app/composables/useAuth.ts` | signIn / signUp / signOut |
| `app/composables/useAiGeneration.ts` | Calls `/api/ai-generate` |
| `app/composables/useBackgroundRemoval.ts` | Calls `/api/remove-background` |
| `app/utils/auth.ts` | `getUserId()` utility — critical |
| `app/assets/css/main.css` | Design tokens + component styles |
| `server/api/ai-generate.post.ts` | Stability AI proxy |
| `server/api/remove-background.post.ts` | remove.bg proxy |
| `server/api/telegram/*.post.ts` | Telegram Bot API routes |
| `server/utils/supabase.ts` | Admin Supabase client (service key) |
| `nuxt.config.ts` | All module config + runtime secrets |

---

## Design System

The design is based on Framer.com's aesthetic — pure black, dark, minimal.

### Key CSS Classes

```css
.glass          /* Frosted glass surface */
.glass-card     /* Glass + blue ring shadow + rounded */
.ring-framer    /* Blue ring: rgba(0,153,255,0.15) */
.auth-glow      /* Blue radial glow for auth pages */
.tracking-display   /* -0.05em letter spacing for hero text */
.tracking-heading   /* -0.03em letter spacing for headings */
```

### Color Reference

```
Pure black background:  hsl(0 0% 0%)     #000000
Foreground text:        hsl(0 0% 98%)    #fafafa
Muted text:             hsl(0 0% 65%)    #a6a6a6
Framer blue accent:     hsl(212 100% 50%) #0099ff
Border:                 hsl(0 0% 12%)    #1f1f1f
Card surface:           hsl(0 0% 4%)     #0a0a0a
```

### shadcn-vue Tokens

All colors reference CSS variables. Use `bg-background`, `text-foreground`, `text-muted-foreground`, `border-border` etc. — never hardcode hex values in components.

---

## State Management

The editor uses **Pinia** (`useEditorStore`). Key state:

```ts
layers[]        // All canvas layers (image | text | line)
selectedId      // Currently selected layer ID
activeTool      // 'select' | 'draw' | 'text' | 'eraser'
history[][]     // Undo/redo snapshots (imageEl stripped before serialize)
imageCache      // Map<id, HTMLImageElement> — never serialized
```

**Important:** `imageEl` is never stored in history (DOM elements can't be serialized). It lives in `imageCache` and is restored via `restoreImageRefs()` after undo/redo.

---

## Auth Flow

```
Anonymous user  → can use editor, download files
                → limited AI credits (3)
                → no library/packs

Authenticated   → full editor + library + packs + Telegram
                → session stored in cookie 'stickr-auth'
                → profile auto-created via DB trigger on signup
```

Route protection:
- `middleware/auth.ts` — redirects to `/auth/login` if not authenticated
- `middleware/guest.ts` — redirects to `/dashboard` if already authenticated

---

## Supabase Schema Summary

```sql
profiles          id, username, full_name, avatar_url,
                  telegram_id, telegram_username,
                  telegram_bot_token, ai_credits

sticker_packs     id, user_id, session_id, name, description,
                  is_telegram_pack, telegram_pack_name

stickers          id, user_id, session_id, pack_id,
                  original_path, processed_path, thumbnail_path,
                  source (upload|drawn|ai_generated|template),
                  ai_prompt, width, height

templates         id, name, category, thumbnail_path,
                  file_path, layers (jsonb), is_active
```

All tables have RLS enabled. Users can only read/write their own data.

---

## Storage Buckets

| Bucket | Public | Contains |
|---|---|---|
| `stickers` | ✅ | Processed sticker files — `{userId}/{uuid}.png` |
| `thumbnails` | ✅ | 128px WebP previews — `{userId}/{uuid}_thumb.webp` |
| `originals` | ❌ | Raw uploads (private) |

---

## API Routes Convention

All server routes follow Nitro conventions:

```
server/api/[name].[method].ts

POST   → server/api/ai-generate.post.ts
GET    → server/api/stickers.get.ts
DELETE → server/api/stickers/[id].delete.ts
```

Error handling pattern:
```ts
throw createError({ statusCode: 400, message: 'Descriptive message' })
```

---

## Common Patterns

### Fetching user data safely

```ts
const supabase = useSupabaseClient()
const user     = useSupabaseUser()

watch(user, (u) => {
  if (u) fetchData()
}, { immediate: true })

async function fetchData() {
  const userId = getUserId(user.value)
  if (!userId) return

  const { data, error } = await supabase
    .from('table')
    .select('*')
    .eq('user_id', userId)
}
```

### Adding a new page

1. Create `app/pages/my-page.vue`
2. Add `definePageMeta({ layout: 'default', middleware: 'auth' })`
3. Add `useHead({ title: 'My Page — Stickr' })`
4. Add nav item in `app/components/AppSidebar.vue`

### Adding a new API route

1. Create `server/api/my-route.post.ts`
2. Use `readBody(event)` for POST data
3. Use `useRuntimeConfig()` for secrets
4. Always `throw createError(...)` on failure — never return error objects

### Adding a new shadcn-vue component

```bash
npx shadcn-vue@latest add [component-name]
```

Components land in `app/components/ui/` and are auto-imported.

---

## Testing

```bash
npm run test         # Unit tests (Vitest)
npm run test:e2e     # E2E tests (Playwright)
```

Test files location:
- `tests/composables/` — composable unit tests
- `tests/stores/` — Pinia store tests
- `tests/server/` — API route tests
- `tests/e2e/` — Playwright browser tests

---

## What NOT to Do

- ❌ Don't use `user.value.id` — use `getUserId(user.value)`
- ❌ Don't import Konva at module level — dynamic import in `onMounted`
- ❌ Don't use `localStorage` — use `useCookie()`
- ❌ Don't use `getStage()` on vue-konva refs — use `getNode()`
- ❌ Don't hardcode colors — use CSS variables / Tailwind tokens
- ❌ Don't add light mode styles — app is always dark
- ❌ Don't expose service key to client — keep in `runtimeConfig` (non-public)
- ❌ Don't use `onMounted` to fetch data — use `watch(user, ...)` pattern
- ❌ Don't serialize `HTMLImageElement` — use `imageCache` Map in store