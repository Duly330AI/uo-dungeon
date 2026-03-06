# ART_STYLE_GUIDE (FORD)

**Status:** Draft v1 · 2025-10-25 · Owners: Art Direction Guild

---

## 1. Vision & Pillars

- **Pixel-Realism Hybrid:** 16×16 base sprites upscaled ×4 (64 px) retaining crisp silhouettes. Lighting favors chiaroscuro, emphasizing moonlit stone, candle hues, and arcane glows.
- **Readable in Motion:** Priority on gameplay legibility—clear team colors, animation anticipation frames, and particle restraint.
- **Grim Hope:** Palette balances desaturated earth tones with focused accent colors (religious gold, necrotic teal) to mirror WORLD_BIBLE themes.

---

## 2. Palette & Color Language

### 2.1 Core Palette Swatches

| Group | Hex | Usage |
|-------|-----|-------|
| Base Stone | #3B3F4A | Dungeon walls, crypt floors |
| Cold Highlight | #6F90C8 | Moonlight rim lights, cold steel |
| Warm Candle | #D9A066 | Abbey interiors, NPC lanterns |
| Blood Accent | #8B2E2E | Enemy eyes, spell sigils |
| Poison Mist | #3C8D5D | Lizardman reagents, toxic pools |
| Holy Gold | #E3C77F | Shrine props, UI highlights |
| Void Black | #0E1119 | Background negative space |

- **Value Steps:** Provide 4-step ramp (shadow, mid, highlight, specular) per material for consistent shading.
- **Biome Variants:** Each biome may extend palette with 2 accent colors max. Reference WORLD_BIBLE faction descriptors.

### 2.2 Lighting & Effects

- Simulate single key light (torches, braziers). Rim-light opposite key for silhouettes.
- Use additive overlays for spells—no pure white; maximum value `#F4F8FF` to avoid bloom clipping.

---

## 3. Characters & Creatures

### 3.1 Scale & Proportions

- Character sprite canvas: 16×24 (base) -> upscale ×4.
- Head counts: Player 4 heads tall, broad shoulders for readability.
- Monster silhouettes distinct (Orc = blocky, Undead = negative space gaps, Daemon = wing span).

### 3.2 Modular Equipment

- Armor layers: base body, armor shell, cape/accessory, weapon overlay.
- Weapon alignments: 45° idle, 30° attack anticipation.
- Recolor via palette swaps; maintain base shading map.

### 3.3 Animation Principles

| Action | Frames | Notes |
|--------|--------|-------|
| Idle | 4 | Subtle breathing, no full cycle >0.6 s |
| Walk | 6 | Contact, recoil, passing, high; ensure readable stride |
| Attack (melee) | 6 | Anticipation (2), swing (2), follow-through (2) |
| Cast | 8 | Focus (2), channel (3), release (3) |
| Hit React | 3 | Impact frame with additive screen flash |

- Use smears on fast weapons; avoid sub-pixel jitter after upscale.
- Modular VFX layers (spell glyphs) separate from body to reuse across outfits.

---

## 4. Tilesets & Environment

### 4.1 Grid & Metrics

- Base tile: 16×16 → 64×64 displayed. Maintain 1 px (scaled) mortar lines for masonry.
- Auto-tiling: Provide 47 tile set (Wang corners) for organic mixes; prefer variant tiles (min 3 per surface).
- Depth cues via vertical gradient (darker bottom) and parallax props (floor trims).

### 4.2 Biome Guidelines (link WORLD_BIBLE)

| Biome | Signature Elements | Palette Notes |
|-------|--------------------|---------------|
| Crypt Undead | Ankhs, bone piles, cold braziers | Emphasize Cold Highlight & Holy Gold contrast |
| Moor Swamp | Boardwalks, fetid pools, reeds | Add Poison Mist + muted desaturated greens |
| Dornforst | Thorn walls, rune stones | Introduce deep purples (#4F2A5A) sparingly |
| Ork Hills | War drums, trophy racks | Warm rust tones (#A85632), skull standards |

- All biome props tagged with faction references for data integration (see TASK-M1-GEN-01/02).
- Collidable props must respect gameplay silhouette (no ambiguous empties).

### 4.3 Lighting & Atmospherics

- Bake ambient occlusion via darker edges (2-3 px) in tiles.
- Fog overlays: 128×128 looping textures, color-coded per biome.

---

## 5. UI & HUD Style

- **Frame Motif:** Riveted brass with subtle emboss; 2 px outer stroke (#1D1F25) + 1 px inner highlight.
- **Typography:** Bitmap font 1.5 px stroke, uppercase for headers, small caps for body. Ensure glyph support for DE/EN.
- **Iconography:** 24×24 base icons (scaled), 8-color limit for clarity.
- Integrate localization by reserving 20% horizontal padding for longer strings.
- Active state glow color matches Holy Gold (#E3C77F); disabled state grayscale to #7B7F8A.

---

## 6. VFX Philosophy

- **Magic:** Glyph overlays use distortion maps + additive particles; each school has signature color (fire = #E25822, cold = #84B6F4, poison = #3C8D5D, energy = #B673F1, earth = #C29C64).
- **Weapon Impacts:** 2-frame flash + debris particles (max 5) to maintain clarity.
- **Status Effects:** Looping halo sprite (e.g., meditation = vertical sine wave band).
- Keep particle counts low (<30 per effect) to preserve readability and performance.

---

## 7. Asset Production Workflow

1. Concept thumbnails aligning with WORLD_BIBLE faction briefs.
2. Palette selection from core table; propose new swatches for review when needed.
3. Pixel pass at 16× base, verifying silhouette at 25% scale.
4. Upscale using nearest-neighbor; apply shader pass for subtle dithering if required.
5. Export PNG w/ metadata, register in `assets/manifest.json`.
6. Update relevant data entries (tileset ID, item icon reference).

---

## 8. Placeholder & CC0 Policy

- Temporary assets use grayscale placeholders with diagonal watermark.
- CC0 sources allowed for prototyping but must be documented and replaced before milestone release.
- Keep attribution ledger in `docs/ASSET_SOURCES.md` (future work).

---

## 9. Review Checklist

- [ ] Palette compliance checked (core + approved accents).
- [ ] Silhouette readable against dark and light backgrounds.
- [ ] Animation loops seamless, no frame pops at 60 FPS.
- [ ] Tiles align grid; collision marker set.
- [ ] UI label space accommodates DE text expansion.
- [ ] VFX performance benchmarked (≤16 ms frame impact on target rig).

---

## 10. References & Inspirations

- Ultima Online classic client – dungeon palette & armor silhouettes.
- Darkest Dungeon – chiaroscuro and UI framing.
- Hyper Light Drifter – readable VFX layering.
- Moonlighter – cozy shop lighting for Abbey interior mood.

---

*Submit proposed updates via art-direction channel; include palette swatch PNG and in-engine screenshot for review.*
