# Save/Load

## Format
- JSON (standard)
- Integrität: SHA-256 über Nutzlast
- `schema_version` im Root

## Slots
- Gespeichert in `IndexedDB` (für große Savegames) und `localStorage` (für Meta-Daten/Quick-Saves).
- Slots: `slot-1`, `auto-save`, `quick-save`

## Policy
- Save/QuickSave sind an sicheren Turn-Snapshots erlaubt (Turn Start/Turn End)
- Während laufender Auflösungsanimationen wird der Save auf den nächsten sicheren Snapshot verschoben
- Autosave: Raumwechsel, Craft fertig, Elite-Kill (gedrosselt)

## Migration
- `save_migrate.ts` vN→vN+1, Tests mit Fixtures
