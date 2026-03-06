# WORLD_BIBLE (FORD) — Welt, Fraktionen, Tonalität

**Projekt:** FORD • **Engine:** Python + Arcade • **Kernidee:** Systemisch spielbare Grenzlande mit UO‑Feeling (0.1‑Skillgains), rundenbasiertem Kampf und datengetriebener Welt.

---

## 1) Leitmotive & Stimmung
- **Frontier-Fantasy:** Vorposten am Rand einer zerrissenen Welt, alte Ruinen, vergessene Sigillen, Portale.
- **Ökologie statt Zufallszoo:** Kreaturen & Fraktionen haben Territorien, Nahrungsketten, Rivalitäten.
- **Gefahr ≠ nur Zahlen:** Fallen, Sichtlinien, Lärm, Leash, Diplomatie (AI‑vs‑AI) formen Situationen.
- **Archaische Mystik:** Magie ist spürbar, aber selten banal; Reagenzien, Runen, Kreise (1–8).

---

## 2) Wer ist der Spieler?
- **Rolle:** *Seeker* (Sucher) – kein Auserwählter, sondern zäher Grenzgänger.
- **Aufhänger:** Rufe der Grenzlande: Artefakte, Wissen, Jagd auf „Named“ Kreaturen, Schließen/Öffnen von Rissen.
- **Mechanische Hooks:** Start‑Perks, Journal‑Foki (Sigillen, Relikt‑Sets), Ruf‑Haken für Fraktionen.

---

## 3) Zonen (Beispiele)
- **Die Schneise:** klaffende Kerbe, in der Portale sporadisch zünden (Mini‑Events, Elementare).
- **Dornforst:** verfilzte Hecken, Reaper‑Haine, Spinnenhorste; Sichtlinien sind Gold.
- **Brockenpfad:** Basaltkämme, Zyklopenhöhle, Gazer‑Beobachtungen bei Nacht.
- **Sumpf von Thar:** Lizardman‑Alchemie, Giftquellen, Bretterstege, Nebelbänke.
- **Alte Krypta:** Lich‑Zirkel, Glockenrätsel, Fallen‑Türen, Knochenglyphen.
- **Orkhügel:** Pallisaden, Wachtfeuer, War‑Drums; Patrouillen & „call‑for‑help“.
- **Obsidiankluft:** Energieschleier, Titanenfragmente, gefährliche Abkürzungen.

Jede Zone bringt **Biome‑Tags** (für Loot/Spawns/Usables) und **Audio-Layer** (Ambience/Snapshots).

---

## 4) Fraktionen — mehr als Diplomatie‑Werte
| Fraktion       | Agenda & Kultur                                   | Konflikte (primär)           | Signatur‑Ressourcen                  |
|----------------|----------------------------------------------------|-------------------------------|--------------------------------------|
| **Orc**        | Beute, Tribut, Schmieden; War‑Drums & Trophäen     | Undead, Lizardman, Mensch     | Rohmetall, grobe Leder, Kriegstrommeln |
| **Undead**     | Bewahrung verbotenen Wissens, Nacht ausweiten      | Orc, Wildlife, Mensch         | Nekrotika, Knochenglyphen, Runenfragm. |
| **Daemon**     | Risse binden, Seelenverträge                       | Alle Sterblichen              | Höllenglut, Paktartefakte            |
| **Elemental**  | Kräftegleichgewicht (Feuer/Kälte/Energie/Erde)     | Daemon, Undead                | Essenzen, Kristalle                  |
| **Gargoyle**   | Portalhüter, steinerne Ehre                        | Daemon, Orc                   | Steinrunen, Glyph‑Werkzeuge          |
| **Ratman**     | Schrott‑Tüftler, Karawanen                         | Orc, Undead                   | Zahnräder, Leichtmetalle             |
| **Lizardman**  | Sumpfheiligtümer, Gifte/Heilkräuter                | Orc, Undead, Mensch           | Toxine, Kräuter, Häute               |
| **Troll/Ogre** | Wucht & Ehrenkodex, Tribut                         | Orc (Rivalität), Mensch       | schwere Waffen, Trophäen             |
| **Dragonkind** | Hort & Balance, seltene Einmischung                 | Daemon, (selten) Mensch       | Schuppen, Atemessenzen               |

**Design‑Hooks:** Händler‑Sortimente, Affix‑Gewichte, Named‑Mobs, Fraktions‑Quests, Sound‑Motivik.

---

## 5) Relikte, Named & Meta‑Fortschritt
- **Sigillen der Grenzlande:** Sammelziele; schalten „Portalschließen“‑Aktionen frei.
- **Named Mobs:** Fraktionsspezifische Bosse/Elites mit Telegraphed‑Moves & Unique‑Drops.
- **Meta:** Ruf je Fraktion (Händler/Rezepte), Sigillen‑Fortschritt, Lore‑Sammlungen (Bookshelves).

---

## 6) Quest‑Samen (leichtgewichtig)
- *Drei Feuer:* Wachtfeuer löschen (Orc) → Ruf + Händlerpreis‑Bonus.
- *Stimme im Stein:* Gargoyle‑Runen ansprechen → Craft‑Rezept.
- *Schwarzer Atem:* Giftquelle dichten (Lizardman) → Alchemie‑Rezepte.
- *Der schweigende Hof:* Glockenreihenfolge (Krypta) → Secret‑Room.

---

## 7) Stil & Benennung (Guides)
- **Orc:** harte Konsonanten (*Gor, Drokk, Vash*).
- **Undead:** sakral/lateinisch (*Ashael, Mort, Thys*).
- **Daemon:** vokalreich/fremd (*Isharuun, Vael*).
- **Gargoyle:** archaisch/steinig (*Tharn, Khar*).
- **Lizardman:** zischend (*Sshai, Zath*).
