
# Lokalisierung (praktisch, JSON-Keys, QA-Checks)

**Stand:** 2025-10-25 · **Ziel:** Schneller i18n-Workflow mit JSON-Resourcen und CI-Validierung. Zielsprachen: **de** und **en**.

## Struktur

```
/i18n/
  en.json
  de.json
/tools/i18n/
  check_missing_keys.py
```

## Keys & Format

- Schlüssel im Namespace-Stil: `ui.inventory.title`, `quest.clear_the_crypt.title`.
- Platzhalter mit Named-Params: `"{actor} hits {target} for {amount}."`.
- Pluralisierung (einfach) via Suffix: `.one` / `.many`.

### Beispiel `en.json`
```json
{
  "ui": {
    "ok": "OK",
    "cancel": "Cancel"
  },
  "quest": {
    "clear_the_crypt": {
      "title": "Clear the Crypt",
      "accept": "The abbot has asked you to cleanse the crypt.",
      "complete": "The crypt is quiet once more."
    }
  }
}
```

## QA-Check (CI)

- **Missing/Extra Keys**: `check_missing_keys.py` vergleicht `en.json` ↔ andere Sprachen.
- **Unbenutzte Keys**: optionale Whitelist.
- **Build Breaker**: fehlende Keys → Fehler.
