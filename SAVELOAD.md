# Save/Load

## Format
- JSON (gzip) standard; MsgPack optional
- Integrität: SHA-256 über unkomprimierte Nutzlast
- `schema_version` im Root

## Slots
`saves/slot-1/last.save`, `auto-###.save`, `quick.save`

## Policy
- Save/QuickSave sind an sicheren Turn-Snapshots erlaubt (Turn Start/Turn End)
- Während laufender Auflösungsanimationen wird der Save auf den nächsten sicheren Snapshot verschoben
- Autosave: Raumwechsel, Craft fertig, Elite-Kill (gedrosselt)

## Migration
- `save_migrate.py` vN→vN+1, Tests mit Fixtures
