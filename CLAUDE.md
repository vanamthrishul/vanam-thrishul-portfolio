@AGENTS.md

# Portfolio Site

Personal portfolio for Vanam Thrishul — fluid, ultra-animated, futuristic single-page site. Static export, no backend.

## Design direction — locked

**Direction D ("Maximal")**, chosen after comparing four mocked-up directions (Liquid Glass, HUD Grid, Kinetic Editorial, Maximal). Source of truth for tokens/animation math: the artifact at `https://claude.ai/code/artifact/d4f89932-f22e-4d01-8e0c-bfeb5b87e585` (also saved as a standalone reference — ask before regenerating it from scratch instead of porting from it).

- **Theme — "forged steel"** (retuned 2026-09-29 from the user's reference render `Just For Referance/idea.png`): navy-black night, brushed/machined steel surfaces, cold indigo rim-light glow, low fog + dust. Replaced the original neon violet/cyan.
- **Palette** (tokens in `app/globals.css`): bg `#05060b`, glow `#6d6dff` (`--color-glow`), ice `#a9b8ff` (`--color-ice`), steel `#c8cdd8`, text `#eef0f6`, muted `#8b91a7`; plus `--steel-text` / `--steel-plate` gradients, `--edge-line` (steel→indigo border), `--chamfer-clip` (angular "machined" corners).
- **UI treatment**: headings (`.hero-heading`, `.section-heading`, `.project-card__title`, `.steel-text`) are brushed-steel gradient text with a slow sheen sweep; buttons/project cards/skill chips are chamfered steel-edged panels (outer element = `--edge-line`, `::before` inset 1px = dark panel); buttons get a knife-gleam sweep on hover; eyebrow markers are small glowing diamonds.
- **Type**: display headline — system sans, weight 800, tight tracking; data/labels — `Consolas`/`Menlo` monospace; body — `Segoe UI`/system-ui.
- **Signature motifs**: metallic trident-skull emblem (a nod to the name Thrishul, "trident") rendered with three.js in `components/TridentSkull3D.tsx` — GPT-generated `public/models/trident-skull-v7.glb` ("knife metal" finish; rough traced outline — holes in the prongs, lumpy edges, merged teeth). **User chose to keep v7 as the emblem (2026-09-29)** after further GPT regeneration attempts didn't come out well. Caveat the user was told and accepted: it's derived from a copyrighted LogoGround logo (`Just For Referance/trident skull.jpg`), so licensing that logo or an original redesign is the clean fix if it ever matters. Replacing it = drop a new .glb in `public/models/` and change `MODEL_URL`. The emblem is a thin extruded badge, so it sways ±~30° + pointer parallax instead of spinning (it would go edge-on). Emblem effects: **knife gleam** (a `RectAreaLight` strip sweeps across every 7s, on hover, and when the scroll takeover starts), **cursor lighting** (indigo/ice point lights chase the pointer; slow orbit on touch), **glow through the cutouts** (additive backlight planes parented to the pivot, pulsing), **scroll takeover** (own ScrollTrigger over the hero's pin + exit: faces camera, zooms, brightens, then tilts away and fades). It floats above `.hero-floor` (reflective ground + horizon line). The old procedural wireframe trident (`lib/trident.ts`) and the constellation canvas (`WireframeCanvas.tsx`) are deleted — both in git history (commit a83f627). Also: glitch-scramble headline reveal, magnetic buttons, animated stat counters, scroll-revealed project cards.
- **Scroll identity** (built): two complementary techniques, both driven by GSAP ScrollTrigger synced to Lenis, both randomized/scrubbed rather than fixed or one-shot:
  - `components/RevolveIn.tsx` — normal-flow content tilts in 3D (rotateX/Y + depth + blur) and resolves as it's scrolled past. Needs real scroll room below an element to fully resolve — don't put it on the last item of a viewport-centered section with nothing following, or it stalls mid-reveal once scrolling maxes out (hit this bug once, fixed via `start: "top 95%", end: "top 60%"`).
  - `components/PinnedStage.tsx` — the screen itself holds still (`ScrollTrigger` `pin: true`) while stacked slide children cross-fade/rotate through it as you scroll; each slide's entrance axis/angle/direction is randomized per mount (`Math.random()`), never the same fixed tilt twice. This is what the user meant by "the screen shouldn't scroll, just the content" plus "rotatory motion randomly, not fixed." **Confirmed with user: applies per-section, not to the whole page as one giant pin.** Real-build intent: Hero pins briefly for a single revolve-in entrance (not multiple slides, then releases); Work section is the natural fit for true multi-slide `PinnedStage` use — pin while cycling through project cards, carousel-style; About/Contact stay normal-flow with `RevolveIn` only (no pin).
  - `components/AtmosphereLayer.tsx` — low rolling fog banks along the bottom + a faint cold haze up top, plus dust motes drifting upward with depth parallax, fixed behind everything site-wide (continues drifting even while a stage is pinned).
  - **Gotcha (hit and fixed):** never put `perspective` / `transform` / `filter` on an *ancestor* of a pinned element (`PinnedStage`, the hero). Such an ancestor becomes the containing block for `position: fixed`, so the pin scrolls away instead of holding — the Work cards were animating off-screen because `.work-section` had `reveal-perspective`. Wrap only the `RevolveIn` content in `.reveal-perspective` (see `WorkSection.tsx`).
  - Known minor polish item: slight ghost/blur bleed from the outgoing slide visible during a PinnedStage transition — cosmetic, revisit when wiring real content in.
- **Site-level additions beyond the mockup** (agreed after mockup review): preloader/load-in sequence (built), custom cursor (built), real inertial smooth scroll via Lenis (built), motion connecting content via RevolveIn + PinnedStage + AtmosphereLayer (built and proven on the temporary test page — still needs to be applied section-by-section to the real Hero/Work/About/Contact content).
- Reference sites for tone: `dungyov.com` (fluid/smooth), `portfolio-zxc.com` (3D/technical, load sequence), `segerman.dev`.

## Tech stack

- Next.js (App Router, TypeScript), static export (`output: "export"` in `next.config.ts`) — stays portable across Vercel/Netlify/GitHub Pages, decision not yet made.
- Tailwind CSS for layout/spacing utilities; design tokens as CSS variables in `app/globals.css`.
- Framer Motion (`motion` package) — magnetic buttons, `whileInView` reveals, preloader exit transition.
- GSAP + ScrollTrigger — scroll choreography between sections.
- Lenis — inertial smooth scroll, synced to GSAP's ticker.
- Vanilla Canvas (TypeScript) — fog + dust atmosphere (`AtmosphereLayer`).
- three.js (plain, no React Three Fiber) — the hero trident-skull emblem only (GLTFLoader + RoomEnvironment reflections).

## Structure (single scrolling page: Home → Work → About → Contact)

```
/app
  layout.tsx              — fonts, SmoothScrollProvider, CustomCursor, Preloader
  page.tsx                 — assembles Hero, Work, About, Contact
  globals.css               — Tailwind entry + design tokens
/components
  Preloader.tsx, CustomCursor.tsx, SmoothScrollProvider.tsx, MagneticButton.tsx
  AtmosphereLayer.tsx (fog + dust), RevolveIn.tsx, PinnedStage.tsx
  Hero.tsx, TridentSkull3D.tsx (emblem), WorkSection.tsx, AboutSection.tsx, ContactSection.tsx
/public/models
  trident-skull-v7.glb     — the emblem mesh
/lib
  content.ts               — single source of truth for placeholder copy (name, title, projects, stats, about, contact links) — swap real content here only
```

## Content status

Placeholder content throughout (`lib/content.ts`), clearly marked. Name is confirmed (Vanam Thrishul); title/project write-ups/resume/images still need to be supplied and swapped in — should require editing `lib/content.ts` only, not layout or animation code.

## Contact section

No backend: `mailto:` + social links for v1. If a real in-page form is wanted later, upgrade path is Formspree or EmailJS (both static-export-compatible) — not built yet, intentionally deferred to avoid a third-party account blocking the build.

## Current status

Site mechanics shell built (Lenis/cursor/preloader), and all four sections are built and wired into `app/page.tsx`: `components/Hero.tsx` assembles the `TridentSkull3D` emblem over `.hero-floor`, a glitch-scramble headline, animated `StatCounter`s, and `MagneticButton`, all backed by `lib/content.ts`; `WorkSection.tsx` cycles project cards through `PinnedStage` (pin verified holding after the perspective-ancestor fix); `AboutSection.tsx` / `ContactSection.tsx` are normal-flow with `RevolveIn` reveals. Whole page retuned to the "forged steel" theme. Static export verified (`npm run build` → `out/`). Deployed to Vercel at `vanam-thrishul-portfolio.vercel.app`, auto-deploying on push to `master` on GitHub (`vanamthrishul/vanam-thrishul-portfolio`).

Still placeholder: real title/project write-ups/resume/images in `lib/content.ts`, and a general polish pass.

## Commands

- `npm run dev` — local dev server
- `npm run build` — static export to `out/`
- `npm run lint` — eslint

## Notes

- Respect `prefers-reduced-motion` everywhere custom animation is added (canvas, cursor, preloader, magnetic buttons) — already the pattern in the mockup; carry it through.
- Hide the custom cursor and lower particle/dust counts on touch/mobile for perf.
- Visual checks: headless Edge (`msedge --headless=new --use-angle=swiftshader --enable-unsafe-swiftshader --screenshot`) renders the WebGL emblem; it can't scroll and won't go below ~500px wide on Windows. For scrolled sections, drive Edge with `puppeteer-core` (install it in a scratch dir, not the project) and `window.scrollTo` + a ~2.5s settle per stop.
