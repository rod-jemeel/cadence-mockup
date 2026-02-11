# Template Design System Reference

Single source of truth for the design system baked into this template. Use this to maintain consistency when building new features.

---

## 1. Foundations

### Typography

- **Font**: FK Grotesk (local, `next/font/local`)
- **CSS variable**: `--font-fk-grotesk`
- **Weights**: 400 (Regular), 500 (Medium), 600 (Bold), 700 (Bold)
- **Files**: `/public/Fonts/FKGroteskTrial-*.otf`
- **Applied**: `${fkGrotesk.className} ${fkGrotesk.variable} antialiased` on `<body>`

### Color Accent

- **Primary**: `#F6BD02` (Flighty-inspired yellow)
- **Foreground on primary**: `oklch(0.145 0 0)` (near-black for contrast)
- **60/30/10 rule**: 60% base, 30% support surfaces, 10% accent

### Border Radius

- `--radius: 0.625rem` (10px)
- `--radius-sm`: 6px | `--radius-md`: 8px | `--radius-lg`: 10px | `--radius-xl`: 14px

### Icons

- **Primary**: Heroicons solid v2 (`@heroicons/react/24/solid`)
- **Outline**: `@heroicons/react/24/outline` (sparingly)

### Spacing

- **Base unit**: 4px
- **Primary rhythm**: 8px multiples (8, 16, 24, 32, 48, 64)
- **Content area**: `px-6 py-6 md:px-8`

---

## 2. Color Tokens

All defined in `app/globals.css` using oklch. Light mode in `:root`, dark mode in `.dark`.

### Light Mode (key values)

| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `oklch(1 0 0)` | White canvas |
| `--foreground` | `oklch(0.145 0 0)` | Near-black text |
| `--card` | `oklch(1 0 0)` | Card surfaces |
| `--primary` | `#F6BD02` | Yellow accent |
| `--primary-foreground` | `oklch(0.145 0 0)` | Text on yellow |
| `--secondary` | `oklch(0.97 0 0)` | Light gray |
| `--muted` | `oklch(0.97 0 0)` | Muted surfaces |
| `--muted-foreground` | `oklch(0.556 0 0)` | Secondary text |
| `--destructive` | `oklch(0.577 0.245 27.325)` | Red |
| `--border` | `oklch(0.922 0 0)` | Borders |
| `--sidebar` | `oklch(0.985 0 0)` | Sidebar bg |

### Dark Mode (key values)

| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `oklch(0.145 0 0)` | Near-black canvas |
| `--foreground` | `oklch(0.985 0 0)` | Off-white text |
| `--card` | `oklch(0.205 0 0)` | Dark card surfaces |
| `--primary` | `#F6BD02` | Yellow (same) |
| `--muted` | `oklch(0.269 0 0)` | Dark muted |
| `--border` | `oklch(1 0 0 / 10%)` | Transparent white |
| `--sidebar` | `oklch(0.205 0 0)` | Sidebar bg |

---

## 3. Tailwind & CSS Setup

```css
/* globals.css */
@import "tailwindcss";
@import "tw-animate-css";
@custom-variant dark (&:is(.dark *));
```

**Base layer**:
```css
@layer base {
  * { @apply border-border outline-ring/50; }
  body { @apply bg-background text-foreground overflow-x-hidden font-sans; }
}
```

**shadcn/ui**: `new-york` style, `neutral` base, CSS variables enabled.

---

## 4. Layout Structure

### Root Layout (`app/layout.tsx`)
- Loads FK Grotesk font
- Wraps in `<Providers>` (includes `<Toaster />` from sonner)

### Route Groups
- `(auth)`: Public routes (login)
- `(protected)`: Authenticated routes wrapped in AppShell

### Protected Shell
```
Suspense > AppShell > ProtoBootstrap + AuthGate > {children}
```

### AppShell Structure
```
SidebarProvider (--sidebar-width CSS prop)
  Sidebar (collapsible icon mode)
  Resize handle (200-400px range, default 256px)
  SidebarInset
    Header (breadcrumb + actions, hidden on dashboard)
    main (flex-1, overflow-y-auto, px-6 py-6 md:px-8)
```

---

## 5. Component Patterns

### Sidebar
- Brand header: icon container `h-7 w-7 rounded-[6px] bg-primary` + app name
- Nav items: `data-[active=true]:bg-muted`, `hover:bg-muted/50`
- Footer: help card + user dropdown with avatar
- Collapsible: `group-data-[collapsible=icon]:hidden` for text elements

### Header
- `h-14 border-b px-4 md:px-6`
- Breadcrumb left, action buttons right
- Export: `variant="outline"`, Share: `variant="ghost" bg-muted/50`

### Dialogs
- **FormDialog**: `max-h-[90vh] flex flex-col`, header/body/footer, sizes sm/md/lg
- **SettingsDialog**: `h-[72vh] grid grid-cols-[220px_1fr]`, left nav + right content
- **SearchDialog**: `w-[720px] max-w-[90vw]`, grouped results, `hover:bg-muted/50`
- **ProfileEditDialog**: `sm:max-w-[400px]`, avatar color picker (8 colors), form fields

### Avatar Colors (8 options)
`primary` (zinc-900), `emerald`, `blue`, `purple`, `pink`, `orange`, `cyan`, `rose` - all with `text-white`

---

## 6. Auth System

### Mock Auth (`lib/proto/auth.ts`)
- Session stored in `proto:auth:session` (localStorage, JSON)
- Type: `{ userId, email, name, username?, avatarColor?, role, createdAt }`
- Functions: `getMockSession()`, `setMockSession()`, `clearMockSession()`

### Login Page
- Split layout: 50/50 desktop (left marketing, right form), stacked mobile
- Form: react-hook-form + zod validation
- Social buttons: Google, Apple, SSO (outline)
- Redirects to `/cadences` or `?next=` param

### AuthGate
- Checks session on mount, redirects to `/login?next=` if missing

---

## 7. Theme System (`lib/proto/theme.ts`)

- Modes: `"light" | "dark" | "system"`
- Storage: localStorage key
- Applies `.dark` class to `<html>` + sets `colorScheme`
- ThemeToggle component: SunIcon/MoonIcon dropdown

---

## 8. Proto Storage (`lib/proto/storage.ts`)

- Namespace: `proto:app:` (update for your project)
- Schema versioning with auto-reset on mismatch
- `ensureProtoSeed()`: initializes default data
- `resetProtoData()`: clears all namespaced keys
- All SSR-safe with try/catch

---

## 9. Key Dependencies

| Category | Package | Version |
|----------|---------|---------|
| Framework | next | 16.0.8 |
| React | react, react-dom | 19.2.1 |
| Styling | tailwindcss | v4 |
| Animation | tw-animate-css | 1.4.0 |
| Utils | clsx, tailwind-merge, cva | latest |
| UI | @radix-ui/* (20+ pkgs) | v1.x |
| Icons | @heroicons/react | 2.2.0 |
| Forms | react-hook-form, zod | 7.x, 4.x |
| Charts | recharts | 2.15.4 |
| Toast | sonner | 2.0.7 |
| Motion | motion | 12.23.26 |
| Scroll | lenis | 1.3.15 |

---

## 10. File Structure Convention

```
app/
  layout.tsx                    Root layout (font, providers)
  globals.css                   Color tokens, Tailwind config
  providers.tsx                 Client providers (Toaster)
  page.tsx                      Root redirect
  (auth)/
    layout.tsx                  Public layout
    login/page.tsx              Login page
  (protected)/
    layout.tsx                  Shell + auth gate
    _components/                Shell components
    dashboard/page.tsx          Dashboard
    [feature]/
      page.tsx                  Thin wrapper
      _components/              Feature components
components/ui/                  shadcn/ui primitives
lib/
  utils.ts                      cn() utility
  proto/                        Mock auth, theme, storage
docs/                           Design documentation
```
