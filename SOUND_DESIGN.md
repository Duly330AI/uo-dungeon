# SOUND_DESIGN (FORD) — Audio‑Konzept für Web Audio API

## 1) Zielbild
- **Atmosphäre:** organisch, dunkel, lesbar; UI dezent.
- **Informationswert:** Schritte (Material), Fallen‑Armen, Gegner‑Vocal (Nähe), Named‑Tells.

---

## 2) Tech‑Stack
- **Web Audio API**; Wrapper „Mixer“ mit Bussen: `MUSIC`, `SFX`, `UI`.
- **Snapshots/States:** Exploration, Combat, Indoor, Cavern (Reverb/LPF per Effekt-Ketten).
- **3D/Cues:** Distanz‑Dämpfung + Low‑Pass ab Schwellwert; Pan nach Position.

---

## 3) Lautheit & Mix (Richtwerte)
- **BGM**: −18 LUFS integ., Peak < −1 dBFS.
- **SFX‑Close**: −14 LUFS, **World** −20..−18, **UI** −22.
- **Side‑Chain:** SFX duckt BGM leicht (−3 dB bei Attack).

---

## 4) Kategorien & Benennung
`audio/sfx/{weapon,creature,magic,trap,foley,ui}/...wav` • `audio/music/...`
Beispiele: `sfx/creature/ettin_attack_v01.wav`, `sfx/trap/poison_arm_v01.wav`.

---

## 5) Regeln
- Schritte nach **Boden‑Tag** (Gras/Stein/Holz/Wasser).
- Priorität: Nahkampf > UI > Ambience.
- Named‑Telegraphs: 2–3 eindeutige Layer (Whoosh, Vocal‑Cue, Impact).

---

## 6) Roadmap
- Pass 1: Platzhalter + Mixer.
- Pass 2: Fraktions‑Stimmen, Waffenvarianz.
- Pass 3: Adaptive Musik‑Layer (Combat/Named/Boss).
