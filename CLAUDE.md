@AGENTS.md

# Portfolio Site

Personal portfolio for Vanam Thrishul — fluid, ultra-animated, futuristic single-page site. Static export, no backend.

## Design direction — locked

**Direction D ("Maximal")**, chosen after comparing four mocked-up directions (Liquid Glass, HUD Grid, Kinetic Editorial, Maximal). Source of truth for tokens/animation math: the artifact at `https://claude.ai/code/artifact/d4f89932-f22e-4d01-8e0c-bfeb5b87e585` (also saved as a standalone reference — ask before regenerating it from scratch instead of porting from it).

- **Palette**: bg `#06050b`, violet accent `#b026ff`, cyan accent `#00e5ff`, text `#f6f4ff`, muted `#948fb8`.
- **Type**: display headline — system sans, weight 800, tight tracking; data/labels — `Consolas`/`Menlo` monospace; body — `Segoe UI`/system-ui.
- **Signature motifs**: rotating wireframe trident (canvas, depth-glowing violet→cyan) — a nod to the name Thrishul ("trident"), built as a clean low-poly geometric construct (twisted-segment shaft, angular crossguard, straight tapering diamond-section prongs) with no devotional/traditional styling — same faceted sci-fi language as the rest of the site, ported in `lib/trident.ts`, spins around its own axis with a gentle sway rather than tumbling so it stays reading as a trident from most angles; particle constellation background, glitch-scramble headline reveal, magnetic buttons, animated stat counters, scroll-revealed project cards.
- **Scroll identity** (built): two complementary techniques, both driven by GSAP ScrollTrigger synced to Lenis, both randomized/scrubbed rather than fixed or one-shot:
  - `components/RevolveIn.tsx` — normal-flow content tilts in 3D (rotateX/Y + depth + blur) and resolves as it's scrolled past. Needs real scroll room below an element to fully resolve — don't put it on the last item of a viewport-centered section with nothing following, or it stalls mid-reveal once scrolling maxes out (hit this bug once, fixed via `start: "top 95%", end: "top 60%"`).
  - `components/PinnedStage.tsx` — the screen itself holds still (`ScrollTrigger` `pin: true`) while stacked slide children cross-fade/rotate through it as you scroll; each slide's entrance axis/angle/direction is randomized per mount (`Math.random()`), never the same fixed tilt twice. This is what the user meant by "the screen shouldn't scroll, just the content" plus "rotatory motion randomly, not fixed." **Confirmed with user: applies per-section, not to the whole page as one giant pin.** Real-build intent: Hero pins briefly for a single revolve-in entrance (not multiple slides, then releases); Work section is the natural fit for true multi-slide `PinnedStage` use — pin while cycling through project cards, carousel-style; About/Contact stay normal-flow with `RevolveIn` only (no pin).
  - `components/AtmosphereLayer.tsx` — soft drifting violet/cyan cloud blobs, fixed behind everything, parallaxing at a slower rate than content (continues drifting even while a stage is pinned, reinforcing the "clouds passing by" feel).
  - Known minor polish item: slight ghost/blur bleed from the outgoing slide visible during a PinnedStage transition — cosmetic, revisit when wiring real content in.
- **Site-level additions beyond the mockup** (agreed after mockup review): preloader/load-in sequence (built), custom cursor (built), real inertial smooth scroll via Lenis (built), motion connecting content via RevolveIn + PinnedStage + AtmosphereLayer (built and proven on the temporary test page — still needs to be applied section-by-section to the real Hero/Work/About/Contact content).
- Reference sites for tone: `dungyov.com` (fluid/smooth), `portfolio-zxc.com` (3D/technical, load sequence), `segerman.dev`.

## Tech stack

- Next.js (App Router, TypeScript), static export (`output: "export"` in `next.config.ts`) — stays portable across Vercel/Netlify/GitHub Pages, decision not yet made.
- Tailwind CSS for layout/spacing utilities; design tokens as CSS variables in `app/globals.css`.
- Framer Motion (`motion` package) — magnetic buttons, `whileInView` reveals, preloader exit transition.
- GSAP + ScrollTrigger — scroll choreography between sections.
- Lenis — inertial smooth scroll, synced to GSAP's ticker.
- Vanilla Canvas (TypeScript) — wireframe + particle system, ported from the mockup's proven JS, not Three.js.

## Structure (single scrolling page: Home → Work → About → Contact)

```
/app
  layout.tsx              — fonts, SmoothScrollProvider, CustomCursor, Preloader
  page.tsx                 — assembles Hero, Work, About, Contact
  globals.css               — Tailwind entry + design tokens
/components
  Preloader.tsx, CustomCursor.tsx, SmoothScrollProvider.tsx, MagneticButton.tsx
  Hero.tsx, WireframeCanvas.tsx, WorkSection.tsx, AboutSection.tsx, ContactSection.tsx
/lib
  content.ts               — single source of truth for placeholder copy (name, title, projects, stats, about, contact links) — swap real content here only
  trident.ts               — procedurally-built trident wireframe vertex/edge math + perspective projection
```

## Content status

Placeholder content throughout (`lib/content.ts`), clearly marked. Name is confirmed (Vanam Thrishul); title/project write-ups/resume/images still need to be supplied and swapped in — should require editing `lib/content.ts` only, not layout or animation code.

## Contact section

No backend: `mailto:` + social links for v1. If a real in-page form is wanted later, upgrade path is Formspree or EmailJS (both static-export-compatible) — not built yet, intentionally deferred to avoid a third-party account blocking the build.

## Current status

Site mechanics shell built (Lenis/cursor/preloader), and all four sections are built and wired into `app/page.tsx`: `components/Hero.tsx` assembles `WireframeCanvas` (trident + constellation, `lib/trident.ts` + the canvas component), a glitch-scramble headline, animated `StatCounter`s, and `MagneticButton`, all backed by `lib/content.ts`; `WorkSection.tsx` cycles project cards through `PinnedStage`; `AboutSection.tsx` / `ContactSection.tsx` are normal-flow with `RevolveIn` reveals. Static export verified (`npm run build` → `out/`). Deployed to Vercel at `vanam-thrishul-portfolio.vercel.app`, auto-deploying on push to `master` on GitHub (`vanamthrishul/vanam-thrishul-portfolio`).

**Known bug to fix**: Hero/Work/About content sits at `opacity: 0` on first paint — the GSAP ScrollTrigger scrub driving `RevolveIn`/the Hero pin starts at progress 0 (matching the `gsap.set(...)` "from" state) until the user scrolls, so a first-time visitor sees only the canvas with no text until they move the page. Confirmed via computed styles on both desktop and mobile; needs an initial-load reveal (not scroll-gated) fix.

Still placeholder: real title/project write-ups/resume/images in `lib/content.ts`, and a general polish pass.

## Commands

- `npm run dev` — local dev server
- `npm run build` — static export to `out/`
- `npm run lint` — eslint

## Notes

- Respect `prefers-reduced-motion` everywhere custom animation is added (canvas, cursor, preloader, magnetic buttons) — already the pattern in the mockup; carry it through.
- Hide the custom cursor and lower particle counts on touch/mobile for perf.
