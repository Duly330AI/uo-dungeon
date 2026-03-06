# UI-Spezifikation (UO‑nah) – HUD, Charakter, Skills, Taschen, Inventar

Ziel: Eine **klare, datengetriebene** UI, die sich **an Ultima Online anlehnt**, aber unsere **rundenbasierte** Kampfmechanik und Files nutzt (`items.json`, `skills.json`, `combat_rules.json`, `progression_rules.json`, `ai/*.json`, `usables/*.json`).

---

## 1) Leitprinzipien
- **Lesbarkeit > Ornament**: Pixel‑Look möglich, aber Buttons/Tooltips modern & konsistent.
- **Datengetrieben**: Alle Labels, Werte, Tooltips ziehen aus JSON‑Daten (keine Duplikate).
- **UO‑Flair**: **Paperdoll**, **Backpack/Container**, **Skill‑Locks (Up/Down/Lock)**, **Journal**.
- **0.1‑Skillgains** sichtbar; „Miss‑Feeling“ ersichtlich (HitChance‑Tooltip).
- **Rundenmodus**: Initiativleiste + Aktionshinweise. **Dex/Recovery** optisch erkennbar.
- **Modularität**: Fenster andockbar, skalierbar, per Tab gruppierbar.
- **Localization**: Alle Strings über Keys (z. B. `ui.skills.swords`), Plural/Genus vorbereitet.
- **Input**: Maus + Tastatur (QWERTZ), optional Controller‑Mapping.
- **Barrierefreiheit**: Schriften skalierbar, Farbenblind‑Profile, konfigurierbare Kontraste.

---

## 2) HUD (Exploration & Kampf)

### 2.1 Statusleisten (oben links, stapelbar)
- **HP / Mana / Stamina / Weight** (Balken + Zahlen).
  - HP = `current / max` (aus Stats).
  - Mana, Stamina analog.
  - **Gewicht**: `carried / max` (aus Items + STR‑Mod).
- **Buff/Debuff‑Pips**: Icons mit Restdauer (Runden oder Sekunden). Tooltip: Quelle, Effekt, Formelhinweis.

### 2.2 Aktionsleiste (unten)
- **Hotbar** (1–0 + F‑Tasten), Slots für Skills, Spells, Items, Makros.
- **Kontext‑Slot**: zeigt letzte „Use‑Target“‑Aktion (z. B. Bandage, Entschärfen).

### 2.3 Journal / Combat‑Log (links unten, einklappbar)
- Meldungen im UO‑Stil:
  - „**+0.1** in *Tinkering* (57.3)“
  - „You miss the orc.“ / „Parried!“ / „Trap disarmed.“
- Filter: **All / System / Loot / Craft / Combat / Quests**.

### 2.4 Minimap (rechts oben)
- Spieler‑Pfeil, Gegner (rot), Verbündete (grün), neutrale Akteure (gelb), Container‑Marker.
- Encounter‑Bubble‑Radius (im Kampf: lila Rand), Leash‑Zonen gesprenkelt.

### 2.5 Rundenkampf‑HUD (einblendbar bei Engagement)
- **Initiativ‑Leiste** (oben): Porträts in Reihenfolge; Recovery/Reload werden als **grauer Cooldown‑Ring** gezeigt.
- **Zug‑Panel** (rechts): Hauptaktion (Attack/Cast/Use), Bewegungsreichweite (Tiles), Restaktionen, Dodge‑Taste.
- **HitChance‑Anzeige** beim Target‑Hover: „**Hit: 47%** (Dein *Swords* 62 vs. *Parrying* 60, DEX Bonus +2)“.
- **Deckungs‑/Winkelindikatoren** (optional): kleine Pfeile/Kantenmarkierungen.

---

## 3) Charakterfenster (Paperdoll & Werte) – Taste **C**
Zweiteilung: **Paperdoll** links, **Werte‑Tabs** rechts.

### 3.1 Paperdoll (UO‑Stil)
- Ziehen von Items direkt auf Slots (Kopf, Hals, Brust, Arme, Hände, Finger, Beine, Füße, Umhang, Gürtelslot, Rucksack).
- Rechtsklick‑Kontext: „Ablegen“, „Vergleichen“, „Reparieren“ (wenn Tool vorhanden), „Färben“ (wenn Dye).

### 3.2 Werte‑Tabs
- **Attribute**: STR / DEX / INT / STAM (jeweils current/cap). Kleine Pfeile für mögliche **Stat‑Gains** (heute).
- **Kampfwerte**: ATK/DEF, Resistenzen `slash|pierce|blunt|fire|cold|poison|energy`, Initiative‑Mod, Move‑Tiles, Recovery‑Mod.
- **Gewichte**: Gesamtgewicht, Encumbrance‑Stufe (leicht/mittel/schwer), Einfluss auf Move‑Tiles.
- **Reagenzien** (optional): Übersicht, falls Magie mit Reags.

**Tooltips** zeigen **Formel‑Shortcuts** (aus `combat_rules.json`), z. B.:
- „ATK = weaponskill + ⌊DEX/5⌋ + Gear + Buffs“
- „Move = 3 + ⌊DEX/40⌋ (Tiles)“

---

## 4) Skills – Taste **K**
- **Liste** mit Suchfeld & Kategorien (**Combat**, **Craft**, **Gathering**, **Magic**, **Stealth**, **Social**).
- **0.1‑Auflösung**; **Cap** sichtbar (z. B. `62.7 / 100`), inkl. Gesamt‑Cap‑Anzeige (z. B. `654.3 / 700`).
- **Skill‑Locks** (UO‑like): **▲** (steigt), **■** (locked), **▼** (sinkt). Tooltip erklärt Auto‑Drop bei Total‑Cap.
- **Kurven‑Profil** (aus `skills.json.xp_curve`) mit Icon (z. B. Linear, Slow‑Start, Fast‑Start). Tooltip beschreibt Progression.
- **Letzte Aktionen** (Mini‑History): wann genutzt, gegen wen/was, geschätztes `p_success` (für den Sweet‑Spot).
- **Train/Use**‑Button (falls anwendbar): führt in der Welt eine ungefährliche Übung aus (z. B. „Shadowboxing“ für Wrestling).

**Skill‑Detail‑Panel (rechts)**:
- Beschreibung + zugeordnete **Stats‑Affinitäten** (STR/DEX/INT/STAM Balken).
- Verlinkte **Rezepte/Spells** (falls Craft/Magic).
- **Aktive Modi** (z. B. Stealth „Sneak“ Slot, Tracking‑Ziele).

---

## 5) Inventar & Taschen – Taste **I**
MVP: **Grid-Inventar** (komfortabel, tooltipreich). Ein UO-Freeform-Skin ist optionales Post-MVP-Feature.

### 5.1 Backpack (Standard)
- Slots / Gewicht / Gold sichtbar. Filter (Waffen, Rüstung, Reagenzien, Materialien, Nahrung, Quest).
- **Stack‑Split**: **Shift+Drag** → Split‑Dialog (Menge & Auto‑Stacken). **Ctrl+Click** → Schnell‑Transfer (in offenen Container).
- **Drag auf Paperdoll** rüstet aus; Drag auf Hotbar legt Quick‑Use an.
- **Reparieren** (Kontext): prüft Tools/Rezepte, zeigt Erfolgs‑Wkeit & Haltbarkeit vorher/nachher.

### 5.2 Container‑Fenster
- Kisten/Truhen/Regale/Schränke/Fässer/Körbe etc. (siehe `USABLES_AND_CONTAINERS.md`):
  - Sperr‑/Fallen‑Status mit Icons; **Lockpick/Disarm**‑Buttons (Hauptaktion im Kampf).
  - **Take All** / **Sort** / **Filter**.
  - **Respawn‑Timer** Anzeige (wenn bekannt).

### 5.3 Item‑Tooltip (datengetrieben)
- **Name**, **Seltenheit**, **Gewicht**, **Wert**.
- **Waffentyp** (slash/pierce/blunt), **Basis‑Schaden**, **Base‑Delay‑Klasse** (light/medium/heavy), erwartete **Recovery** (mit DEX).
- **Resist‑Werte** (bei Rüstungen), **Durability** (z. B. 36/60).
- **Benötigte Skills** (z. B. Magierstab → „Magery 30+“).
- **Set‑/Unique‑Marker** (später für Named Items).

---

## 6) Spellbook – Taste **L** (oder **B**)
- Reiter pro Schule (z. B. **Circle 1–8** oder thematisch).
- Liste der Sprüche, Kosten (Mana + Reagenzien), **Cast‑Runden** (mit INT/Meditation‑Reduktion), Reichweite, Effekte.
- **Drag‑&‑Drop** auf Hotbar; Rechtsklick: „Als Macro“ (Auto‑Target‑Self/Last).

---

## 7) Crafting – Taste **J**
- **Rezept‑Liste** links (Filter: Kategorie, Station, Skill‑Req).
- **Detail‑Panel** rechts: Inputs (mit Inventar‑Zahl), Tool/Station, **Erfolgs‑Wkeit** (Sweet‑Spot‑Tooltip!), Zeit in Sekunden/Runden, **XP‑Hinweis** (Gain‑Chance).
- **Queue** mit Prioritäten; läuft auf Rundenzeit in allen Modi weiter.

---

## 8) Händler & Handel
- Kauf/Verkauf‑Tabelle; dynamische Preise (Economy‑Hooks).
- **Schnellverkauf** per Ctrl+Click (mit Bestätigungs‑Guard ab „rare“).
- **Favoriten** & **Wunschliste** (zeigt Marker, wenn Container/Händler Item führt).

---

## 9) Interaktion & Zielsystem
- **Double‑Click** = Benutzen/Interagieren (UO‑like).
- **Rechtsklick** = Kontextmenü (Use, Equip, Compare, Split, Drop, Lockpick, Disarm).
- **Use‑Target‑Cursor** (klassischer UO‑Cursor) für Items/Spells/Skills, mit **ESC** abbrechbar.
- **Hover** zeigt LOS & Reichweite (Kampf) sowie Traps/Lock‑Hints (mit Detect Hidden).

---

## 10) Shortcuts (QWERTZ Default)
- **C** Charakter, **K** Skills, **I** Inventar, **M** Map, **J** Journal / **G** Crafting, **B** Spellbook.
- **Leertaste**: **Dodge-Aktion** oder `end_turn` (konfigurierbar je Kontext).
- **R** „Letzte Aktion“ wiederholen (z. B. Bandage auf dich selbst).
- **Tab** Zielwechsel, **Shift** Multi‑Select/Stack‑Split, **Ctrl** Schnell‑Transfer.
- **F1–F12**: Makros/Hotbar‑Reiter. **Alt**: Tooltips erweitern (Formeldetails).

---

## 11) Fenster‑Management
- **Andocken**, **Größe** & **Transparenz** je Fenster speicherbar (pro Profil).
- **Layouts**: Exploration, Kampf, Handwerk (3 Profile, per Taste umschaltbar).
- **Reset** & **UI‑Skalierung** (80–150%).

---

## 12) Barrierefreiheit & Optionen
- **Schriftgröße** (S/M/L/XL), **Farbenblind‑Profile**, **Kontrast‑Boost**.
- **Beschriftete Icons** (Labels), **Tooltips zeitverzögert**.
- **Tastatur‑Remapping**, **Controller** (Radial‑Menüs für Kontext/Hotbar).

---

## 13) Daten‑Bindings & Events (Engine‑Hooks)

### 13.1 Bindings (Beispiele)
- `ui.hp.value ← stats.hp.current`
- `ui.resists.fire ← derivedResists.fire`
- `ui.skills["swords"].value ← skills.swords.value` (0.1‑Auflösung)
- `ui.weapon.recoveryPred ← fRecovery(DEX, weapon.base_delay, combat_rules)`
- `ui.inventory.weight ← inventory.totalWeight()`

### 13.2 Event‑Bus (Namen vorgeschlagen)
- `SKILL_GAIN` { id, delta:0.1, newValue }
- `STAT_GAIN` { id, delta:0.1, newValue }
- `HIT_RESULT` { target, hit:boolean, parried:boolean, damage }
- `LOOT_ADDED` { containerId, items:[…] }
- `CRAFT_DONE` { recipeId, outputs }
- `COMBAT_TURN_START` { actorId, round } / `COMBAT_TURN_END`
- `UI_TOAST` { textKey, params }
- `CONTAINER_RESPAWNED` { placementId }

---

## 14) Fehler‑ & Zustandsmeldungen
- **Inventar voll** (zeigt `+x/x kg`, rote Zahl).
- **Keine Munition** (Bogen‑Icon blinkt).
- **Recovery aktiv** (Angriff‑Button grau + Tooltip „Erholung: 1 Runde“).
- **Skill gelockt** (Pfeil‑Icon wechselt auf „■“).
- **Diebstahlwarnung** (Ownership).

---

## 15) Beispiel‑Wireframes (ASCII)

**Paperdoll & Werte**
```
+----------------------+  +----------------------------------+
|   [ Kopf ]           |  | Attribute   STR 62/100   ▲       |
| [Amulett]            |  |            DEX 71/100   ■       |
|  [Brust] [Umhang]    |  |            INT 35/100   ▼       |
| [Arme]   [Hände]     |  | Stamina  82/110                 |
|  [Gürtel][Rucksack]  |  | Resists: Sl 12  Pi 8  Bl 5 ...  |
| [Beine]  [Füße]      |  | ATK 64  DEF 59  Move 5 tiles    |
+----------------------+  +----------------------------------+
```

**Skills**
```
+---------------------------+  +------------------------------+
| Suche...  [Combat][Craft] |  | SWORDS  62.7  ▲ (Linear)     |
| SWORDS       62.7  ▲      |  | Affinitäten: STR■■■ DEX■■■   |
| TACTICS      55.2  ▲      |  | Letzte Nutzung: 2m           |
| ANATOMY      41.0  ■      |  | Sweet-Spot: ~50% Treffer     |
| LOCKPICKING  12.4  ▼      |  | Verlinkte Rezepte/Spells     |
+---------------------------+  +------------------------------+
```

**Runden‑HUD**
```
[ Orc ]-[ You ]-[ Skeleton ]-[ Archer ]-[ Ogre ]
         ^ Dein Zug   Recovery: 1 Runde  Dodge: verfügbar
```

---

## 16) Umsetzungshinweise (Frontend)

- **Technik**: React/TypeScript o.ä.; UI‑State via Zustand/Recoil/Redux; Event‑Bus (mittels mittlerem Pub/Sub).
- **Perf**: Batched Updates (requestAnimationFrame), Memoization für Listen (Skills/Inventar).
- **Tooltip‑Engine**: Markdown‑fähig, Lazy Load (bei Hover).
- **Persistenz**: Layout & Hotkeys in `ui_profile.json` (pro Save Slot).

---

## 17) Mapping zu Dateien
- `skills.json` → Liste, Werte, **Lock‑Status** (Up/Down/Locked; Flag per Save), `xp_curve`‑Icon.
- `progression_rules.json` → Tooltips zu Sweet‑Spot/Slowdown; Journal‑Meldungen (0.1).
- `combat_rules.json` → HitChance‑Tooltip, Recovery/Move‑Anzeige.
- `items.json` → Tooltips (Schaden/Delay/Resists/Weight/Ammo/Regs).
- `ai/*.json` → Minimap/KI‑Pings (Aggro‑Radius, Call‑for‑Help).
- `usables/*.json` → Container/Trap‑Icons, Lockpick/Disarm‑Buttons.

---

## 18) QA‑Checkliste
- 0.1‑Skillgain wird **immer** korrekt angezeigt (+Journal).
- Skill‑Locks verhindern Anstieg/Senkung wie vorgesehen.
- Recovery blockiert **nur** Attacke, nicht Move/Use (UI spiegelt).
- Split‑Stacks, Schnell‑Transfer, Hotbar‑Drag funktionieren.
- Container‑Respawn‑Timer konsistent (Save/Load).
