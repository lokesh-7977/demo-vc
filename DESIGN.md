# Lokvera — Design System

A premium, dark, AI-first landing page for **Lokvera**, an AI Voice Agent + Lead-Gen CRM
for Indian businesses. Inspired by the enterprise polish of Netomi, but with an original
identity, layout, and illustration set.

## Brand personality

Premium · modern · confident · enterprise-grade · AI-first · minimal · future-focused.
No bright startup colors — a sophisticated dark palette carries the whole experience.

## Palette

All tokens live as CSS variables in `src/styles.css` (`:root`).

| Token | Value | Use |
| --- | --- | --- |
| `--bg-base` | `#05060c` | Page background (near-black navy) |
| `--bg-elevated` | `#0a0c16` | Raised surfaces / floating chips |
| `--brand-blue` | `#4f7cff` | Primary accent (electric blue) |
| `--brand-violet` | `#8b5cf6` | Secondary accent (soft purple) |
| `--brand-cyan` | `#38e1d0` | Signal / success / waveform |
| `--text-strong` | `#f4f6ff` | Headings |
| `--text` / `--text-soft` / `--text-faint` | greys | Body / muted / hint |
| `--surface` / `--surface-strong` | white @ 3–6% | Glass fills |
| `--line` / `--line-strong` | white @ 8–16% | Borders |

Accents are only ever used as **subtle gradients** (`brand-blue → brand-violet`) or soft
radial glows — never flat fills of saturated color.

## Typography

- **Display** — `Space Grotesk` (`.font-display`): hero + section headings.
- **Body** — `Manrope`: everything else.
- Large hero type (`clamp` up to `text-6xl`), tight tracking, generous line-height.
- `.text-gradient` for white→blue→violet headline emphasis.
- `.eyebrow` uppercase kicker above every section heading.

## Signature effects

- **Glassmorphism** — `.glass`, `.glass-hover` (blur + inset highlight + soft shadow).
- **Gradient borders** — `.card-gradient-border` (masked 1px conic border).
- **Ambient aurora** — fixed radial glows + faint grid via `body::before/::after`.
- **Spotlight** — `.spotlight` halo behind the highlighted pricing plan.
- **Motion** — Framer Motion (`motion/react`): scroll reveals, hero entrance, animated
  waveform, rotating globe, scroll-linked workflow timeline, animated tab pill, marquee.
- All motion respects `prefers-reduced-motion`.

## Architecture (Next.js App Router)

```
src/
  app/
    layout.tsx     shell, Metadata/Viewport API, GTM (next/script), Navbar + Footer + VoiceOrb
    page.tsx       composes the section components
    globals.css    Tailwind v4 theme + design tokens + keyframes + smooth-scroll offsets
  components/
    ui/            shadcn primitives (button, badge)
    primitives/    Reveal, SectionHeading, Logo, Waveform, VoiceOrb
    mockups/       HeroDashboard, Globe, ShowcasePanels  (fake product UI)
    sections/      Navbar (Netomi-style mega-menu), Hero, Features, Languages,
                   Roles, Workflow, Industries, Showcase, Pricing, Faq, FinalCta, Footer
  lib/
    content.ts     all copy + data (single source of truth)
    utils.ts       cn() helper
```

- Server Components by default; only hook/motion components carry `'use client'`
  (Navbar, Hero, Reveal, HeroDashboard, Globe, Workflow, Showcase, Faq, FinalCta,
  VoiceOrb, Button).
- **Dynamic navbar** — transparent → glass-on-scroll, hover mega-menus (Features /
  Solutions) with rich panels, a live "AI Voice · Live" waveform pill, and a floating
  animated **VoiceOrb** CTA with pulsing soundwave rings.

- **shadcn/ui** (new-york, slate base) via `components.json`; `@/*` path alias.
- Every section is an isolated, reusable component driven by typed data in `content.ts`.
- Content is intentionally honest — no fake logos, testimonials, stats, or badges.

## Tech

TypeScript · Tanstack react start(React 19) · Tailwind CSS v4 · Framer Motion · Lucide ·
shadcn/ui.