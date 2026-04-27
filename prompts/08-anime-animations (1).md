# Anime UI Enhancement — Animation & Polish Prompt

> Use this to upgrade an existing anime-styled UI with smooth, kawaii motion design. Drop this into your Claude Code agent (or any frontend dev). It assumes you already have a working app with anime aesthetics — this prompt makes it *feel* alive.

## Goal
Transform a static anime-styled UI into one that feels playful, soft, and reactive — without sacrificing usability or accessibility. Every animation must be **purposeful, fast, and respect `prefers-reduced-motion`**.

## Design principles

1. **Pop, don't bounce.** Use snappy ease-out curves (`cubic-bezier(.22, 1, .36, 1)`) with 150–250ms durations. Long bounces feel cheap.
2. **Layered depth.** Cards have a chunky drop-shadow (offset Y, no blur) that "presses" on click — like a physical button.
3. **Sparkle accents.** Tiny ✦ ✿ ☆ glyphs orbit/twinkle around selected or hover states. Decorative only, never block content.
4. **Smooth state changes.** Color/border transitions, not abrupt swaps.
5. **Entrance choreography.** Lists stagger in (50ms apart). Pages fade + lift slightly.
6. **Reduced-motion fallback.** All animations gated behind `@media (prefers-reduced-motion: no-preference)` or use `prefers-reduced-motion` checks in JS.

## Color palette (Sakura — default anime skin)

Soft pastels, high-contrast ink, no pure black. Pink primary, cyan accent, mint success.

```css
:root[data-skin="anime"] {
  /* Surfaces */
  --bg:          #fff5f9;   /* page bg, warm pink-tinted white */
  --surface:     #ffffff;   /* cards */
  --surface-2:   #fff0f6;   /* subtle nested surface */
  --line:        #ffd6e7;   /* default borders */
  --line-strong: #ffb6d1;   /* hovered borders */

  /* Ink */
  --ink:    #2a1a3a;        /* body text, deep plum (never #000) */
  --ink-2:  #4a2d5c;        /* secondary headings */
  --muted:  #8a6a9a;        /* labels, helper */
  --muted-2:#b094c0;        /* placeholders */

  /* Brand + accents */
  --brand:       #ff5e9c;   /* sakura pink */
  --brand-soft:  #ffe0ee;   /* tinted bg for selected states */
  --brand-ink:   #ffffff;   /* text on brand */
  --accent:      #6ec1ff;   /* sky cyan — secondary CTAs, info */
  --success:     #5fd4a3;   /* mint */
  --warn:        #ffb84d;   /* peach */
  --danger:      #ff6b8a;   /* coral */

  /* Press shadows — chunky offset, no blur */
  --press-shadow:        0 4px 0 rgba(180,60,120,.35);
  --press-shadow-hover:  0 5px 0 rgba(180,60,120,.40);
  --press-shadow-active: 0 1px 0 rgba(180,60,120,.35);
}

:root[data-skin="anime"][data-theme="dark"] {
  --bg:          #1a0e26;
  --surface:     #251434;
  --surface-2:   #2e1840;
  --line:        #4a2865;
  --line-strong: #6b3d8e;
  --ink:    #fff0f8;
  --ink-2:  #ffd6ec;
  --muted:  #c89ae0;
  --muted-2:#a072c0;
  --brand-soft: #4a1d3a;
}
```

### Alternate anime palettes (offer as presets)

| Name | `--brand` | Vibe |
|---|---|---|
| Sakura pink (default) | `#ff5e9c` | classic kawaii |
| Ocean cyan | `#22d3ee` | cool, idol-game |
| Night magic | `#c084fc` (dark) | mahou shoujo |
| Sunset orange | `#fb923c` | shonen energy |
| Mint dream | `#34d399` | calm, slice-of-life |

### Gradient recipes

```css
/* CTA / brand surfaces */
background: linear-gradient(135deg, #ff9ec7, var(--brand));

/* Hero card — multi-stop pastel */
background:
  radial-gradient(700px 380px at 0% 0%, rgba(255,158,199,.6), transparent 60%),
  radial-gradient(700px 380px at 100% 100%, rgba(110,193,255,.5), transparent 60%),
  linear-gradient(135deg, #ffb8d4, #c4b3ff 50%, #a8d8ff);

/* Card visual (payment card etc) */
background: linear-gradient(135deg, #ff9ec7, var(--brand) 50%, #6e4dab);
```

### Color usage rules

- **Borders are always 2–2.5px**, colored `--line` default, `--brand` when selected/focused.
- **Selected state** = `border-color: var(--brand)` + `background: linear-gradient(180deg, var(--brand-soft), var(--surface))` + chunky shadow.
- **Hover state** = `border-color: var(--line-strong)` + `transform: translateY(-2px)` — never just background swap.
- **Never use pure black/white text.** Use `--ink` (deep plum) and `--bg` (pink-white).
- **Sparkle glyphs** (✦ ✿ ☆) tinted `var(--brand)` with optional `text-shadow: 0 0 8px var(--brand-soft)` glow.

## Animation tokens

```css
:root {
  --ease-out:    cubic-bezier(.22, 1, .36, 1);   /* main curve — snappy decelerate */
  --ease-in-out: cubic-bezier(.4, 0, .2, 1);     /* layout/color transitions */
  --ease-bounce: cubic-bezier(.34, 1.56, .64, 1);/* selected pop, use sparingly */
  --dur-fast:    150ms;   /* press, tap feedback */
  --dur-base:    220ms;   /* hover, color, selection */
  --dur-slow:    380ms;   /* page transitions, modals */
  --dur-loop:    4s;      /* float, twinkle */
}
```

## Hover animation catalogue

Every hoverable element gets ONE motion + ONE color change. Combine sparingly.

| Element | On hover | Duration | Curve |
|---|---|---|---|
| Primary CTA | `translateY(-1px)` + shadow Y +1px + brightness +5% | `--dur-fast` | `--ease-out` |
| Game card | `translateY(-4px) rotate(-.4deg)` + border → `--brand` | `--dur-base` | `--ease-out` |
| Package card | `translateY(-3px) rotate(-.3deg)` + border → `--brand` | `--dur-base` | `--ease-out` |
| Category chip | `translateY(-1px)` + border → `--brand` | `--dur-fast` | `--ease-out` |
| Icon button | `background: var(--brand-soft)` + `scale(1.05)` | `--dur-fast` | `--ease-out` |
| Bank/payment row | border → `--brand` + bg → `--brand-soft` (no transform) | `--dur-base` | `--ease-in-out` |
| Nav link | `background: var(--brand-soft)` + `color: var(--brand)` | `--dur-fast` | `--ease-in-out` |
| Avatar/chip | `scale(1.04)` + ring `0 0 0 3px var(--brand-soft)` | `--dur-fast` | `--ease-out` |
| Text link | underline grows from 0 → 100% width (left-anchored) | `--dur-base` | `--ease-out` |
| Sparkle (decorative) | `rotate(15deg)` + brightness +10% | `--dur-base` | `--ease-bounce` |

### Hover example (canonical)

```css
.game {
  transition:
    transform   var(--dur-base) var(--ease-out),
    box-shadow  var(--dur-base) var(--ease-out),
    border-color var(--dur-base) var(--ease-in-out);
}
.game:hover {
  transform: translateY(-4px) rotate(-.4deg);
  border-color: var(--brand);
  box-shadow: 0 8px 0 rgba(255,94,156,.2), 0 16px 30px rgba(255,94,156,.25);
}
.game:focus-visible {
  outline: 2.5px solid var(--brand);
  outline-offset: 3px;
}
```

### Hover rules

- Always pair transform + color change — never just one.
- Shadow Y-offset increases by 1–2px on hover (chunky lift).
- Active/pressed: shadow shrinks to 1px Y, transform `translateY(+3px)` (the press).
- Focus-visible always more visible than hover (2.5px outline + offset).
- No hover-only info — everything reachable by tap/keyboard too.

## Animation library to implement

### 1. Press-down buttons (chunky physical feel)
```css
.cta {
  transition: transform var(--dur-fast) var(--ease-out),
              box-shadow var(--dur-fast) var(--ease-out);
  box-shadow: var(--press-shadow);
}
.cta:hover { transform: translateY(-1px); box-shadow: 0 5px 0 rgba(180,60,120,.4); }
.cta:active { transform: translateY(3px); box-shadow: var(--press-shadow-active); }
```

### 2. Card hover — lift + slight rotate
```css
.card {
  transition: transform var(--dur-base) var(--ease-out),
              box-shadow var(--dur-base) var(--ease-out),
              border-color var(--dur-base) var(--ease-out);
}
.card:hover { transform: translateY(-4px) rotate(-.4deg); }
```

### 3. Selected sparkle
```css
.pkg[aria-pressed="true"]::after {
  content: "✦"; position: absolute; top: 6px; right: 8px;
  color: var(--brand); font-size: 14px;
  animation: spin 3s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
```

### 4. Twinkling background sparkles
```css
.stage::before {
  content: ""; position: fixed; inset: 0; pointer-events: none;
  background-image:
    radial-gradient(circle at 12% 20%, #fff 1px, transparent 2px),
    radial-gradient(circle at 88% 35%, #fff 1.5px, transparent 2.5px),
    radial-gradient(circle at 22% 75%, #ffd6e7 1.5px, transparent 2.5px),
    radial-gradient(circle at 70% 85%, #fff 1px, transparent 2px);
  animation: twinkle 5s ease-in-out infinite alternate;
}
@keyframes twinkle { 0% { opacity: .3 } 100% { opacity: .7 } }
```

### 5. Float for hero gems / mascots
```css
.gem { animation: float 4s ease-in-out infinite; }
.gem.b { animation-delay: -1.5s; }
.gem.c { animation-delay: -3s; }
@keyframes float {
  0%, 100% { transform: translateY(0) rotate(8deg); }
  50%      { transform: translateY(-10px) rotate(8deg); }
}
```

### 6. Stagger entrance (lists/grids)
Use Framer Motion or vanilla:
```jsx
{items.map((it, i) => (
  <motion.div key={it.id}
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: i * 0.05, duration: 0.3, ease: [.22,1,.36,1] }}>
    {/* card */}
  </motion.div>
))}
```

### 7. Page transitions
```jsx
<AnimatePresence mode="wait">
  <motion.div key={route}
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.25, ease: [.22,1,.36,1] }}>
    {screen}
  </motion.div>
</AnimatePresence>
```

### 8. Success burst — confetti or radial sparkle
On payment success, spawn 8–12 ✦/❀/☆ glyphs that fade-out and scatter:
```jsx
function SuccessBurst() {
  return Array.from({length: 12}).map((_, i) => {
    const angle = (i / 12) * Math.PI * 2;
    return <motion.span key={i} style={{position:"absolute"}}
      initial={{ x:0, y:0, opacity:1, scale:0 }}
      animate={{ x: Math.cos(angle)*120, y: Math.sin(angle)*120, opacity:0, scale:1 }}
      transition={{ duration: .9, ease:"easeOut" }}>✦</motion.span>;
  });
}
```

### 9. QR scanning shimmer
```css
.qr::after {
  content: ""; position: absolute; inset: 0;
  background: linear-gradient(180deg, transparent, rgba(255,94,156,.4), transparent);
  height: 30px; animation: scan 2s linear infinite;
}
@keyframes scan { 0% { transform: translateY(-30px); } 100% { transform: translateY(220px); } }
```

### 10. Number tick-up (totals, package amounts)
Use Framer Motion's `useMotionValue` + `animate()` to count from old → new value over 400ms.

## Micro-interactions checklist

- [ ] Input focus: border + soft glow ring grows in over 180ms
- [ ] Validation success: green checkmark fades + scales in (`scale 0 → 1`, 200ms back-ease)
- [ ] Tab/chip swap: underline slides between active items (`layoutId` in Framer Motion)
- [ ] Loading: replace spinners with a 3-dot pulse using staggered keyframes
- [ ] Toast: slide-up from bottom + tiny tilt
- [ ] Modal/sheet: backdrop fades, sheet slides up with overshoot (220ms ease-out)
- [ ] Empty state: mascot SVG with gentle bobbing
- [ ] Skeleton loaders: soft pink shimmer instead of grey

## Implementation steps

1. **Install** Framer Motion: `pnpm add framer-motion`
2. **Add tokens** above to your global CSS / Tailwind theme.
3. **Replace plain divs** for cards/buttons/CTAs with motion equivalents.
4. **Wrap routes** in `AnimatePresence` for smooth page changes.
5. **Add the sparkle background** layer to your top-level stage element.
6. **Audit reduced-motion**: wrap CSS animations in `@media (prefers-reduced-motion: no-preference)`. Use `useReducedMotion()` from Framer Motion in JSX.
7. **Profile**: animations should never drop below 60fps on a mid-tier mobile. Use `transform` + `opacity` only — never `top`/`left`/`width`.

## Accessibility rules (non-negotiable)

- All decorative sparkles `aria-hidden="true"` and `pointer-events: none`.
- No animation longer than 500ms blocks interaction.
- Focus states are stronger than hover states (2.5px brand-colored outline + glow).
- `prefers-reduced-motion: reduce` disables all loops, keeps only fade/color.
- Respect `aria-pressed`, `aria-selected` for state styling — never use color alone.

## Don'ts

- ❌ No bouncing springs longer than 400ms — feels childish, not kawaii.
- ❌ No parallax scrolling — distracting, kills perf on mobile.
- ❌ No flashing/strobing ever (epilepsy safety).
- ❌ No animating box-shadow blur radius (paint-thrashing). Use Y-offset only.
- ❌ Don't animate `width`/`height`. Animate `transform: scaleX/Y`.

## Acceptance

- Every interactive element responds within 100ms with motion feedback.
- Page-to-page transition <300ms, never feels stuck.
- Mid-tier Android Chrome holds 60fps on the home grid scroll.
- Lighthouse perf ≥ 90, a11y ≥ 95.
- With `prefers-reduced-motion: reduce`, the UI is fully usable and shows no looping animations.

## Reference vibes
Think: **Animal Crossing menus**, **Genshin Impact's gacha pull screen**, **Honkai Star Rail's UI snap**, **Pokémon Sleep onboarding**. Soft + reactive + chunky-shadow + tiny sparkles. Not Sailor Moon retro.
