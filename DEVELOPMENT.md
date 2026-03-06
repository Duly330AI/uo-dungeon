# FORD Development Setup

## Quick Start

### 1. Load Development Environment

```powershell
# In PowerShell (project root):
. .\dev.ps1
```

This loads helper functions like `poetry`, `pre-commit`, `lint-all`, etc.

### 2. Install Dependencies (First Time)

```powershell
install-deps
```

### 3. Install Pre-Commit Hooks (First Time)

```powershell
install-hooks
```

### 4. Check Status

```powershell
dev-status
```

---

## Available Commands

### Setup Commands

- `install-deps` - Install all dependencies from poetry.lock
- `install-hooks` - Install pre-commit git hooks

### Development Commands

- `poetry <cmd>` - Run poetry commands (e.g., `poetry add <package>`)
- `pre-commit <cmd>` - Run pre-commit commands
- `ruff <cmd>` - Run ruff linter
- `black <cmd>` - Run black formatter
- `pytest <cmd>` - Run pytest
- `run-game` - Run the FORD game

### Linting Commands

- `lint-all` - Run pre-commit on all files
- `lint-staged` - Run pre-commit on staged files only

### Utility Commands

- `dev-status` - Show development environment status
- `dev-help` - Show available commands
- `python scripts/check_doc_data_consistency.py --root .` - Verify critical doc/data drift rules
- `python scripts/validate_content.py --root .` - Run schema + cross-ref + drift checks in one pass

---

## Manual Commands (if dev.ps1 not loaded)

If you haven't loaded `dev.ps1`, use full paths:

```powershell
# Poetry
.\.venv\Scripts\poetry.exe install

# Pre-commit
.\.venv\Scripts\pre-commit.exe run --all-files

# Ruff
.\.venv\Scripts\ruff.exe check .

# Black
.\.venv\Scripts\black.exe .

# Pytest
.\.venv\Scripts\pytest.exe
```

---

## Troubleshooting

### "poetry is not recognized"

**Solution:** Load `dev.ps1` first:

```powershell
. .\dev.ps1
```

### "pre-commit.exe is not recognized"

**Solution:** Install dependencies:

```powershell
. .\dev.ps1
install-deps
```

### "poetry.lock not found"

**Solution:** Generate lock file:

```powershell
.\.venv\Scripts\poetry.exe lock
```

### "Dependencies out of sync"

**Solution:** Reinstall:

```powershell
. .\dev.ps1
poetry install --no-root
```

---

## Dependency Management

### Add a New Dependency

```powershell
# Production dependency:
poetry add <package>

# Dev dependency:
poetry add --group dev <package>
```

### Update Dependencies

```powershell
# Update all:
poetry update

# Update specific package:
poetry update <package>
```

### Show Installed Packages

```powershell
poetry show --tree
```

---

## Pre-Commit Hooks

Pre-commit hooks run automatically on `git commit` and check:

- Markdown linting (docs/)
- YAML syntax (data/)
- Black formatting (game/)
- Ruff linting (game/)

### Run Manually

```powershell
# All files:
lint-all

# Staged files only:
lint-staged

# Specific files:
pre-commit run --files file1.py file2.py
```

### Skip Hooks (Emergency)

```powershell
git commit --no-verify
```

---

## Python Environment

### Activate Virtual Environment

```powershell
.\.venv\Scripts\Activate.ps1
```

### Deactivate

```powershell
deactivate
```

### Python Version

```powershell
conda activate ford && python --version
# Should show: Python 3.12.x
```

---

## Common Workflows

### Daily Development

```powershell
# 1. Load helpers
. .\dev.ps1

# 2. Check status
dev-status

# 3. Make changes...

# 4. Lint before commit
lint-staged

# 5. Commit (hooks run automatically)
git commit -m "feat: your changes"
```

### After Pulling Changes

```powershell
# Update dependencies if poetry.lock changed:
. .\dev.ps1
install-deps
```

### Running Tests

```powershell
# All tests:
pytest

# Specific test file:
pytest tests/systems/test_combat.py

# With coverage:
pytest --cov=game --cov-report=html
```

---

## Editor Integration

### VS Code

1. Install Python extension (Microsoft)
2. Select interpreter: `Ctrl+Shift+P` → "Python: Select Interpreter" → `.venv\Scripts\python.exe`
3. Install recommended extensions (prompts on open)

### PyCharm

1. File → Settings → Project: ford → Python Interpreter
2. Add → Existing Environment → `.venv\Scripts\python.exe`

---

## CI/CD

GitHub Actions runs on every push:

- Linting (ruff, black)
- Tests (pytest)
- Pre-commit checks

See `.github/workflows/ci.yml` for details.

---

## Documentation

- **Architecture:** `docs/ARCHITECTURE.md`
- **Gameplay:** `docs/GAMEPLAY.md`, `docs/GAMEPLAY_ADDENDUM_UO.md`
- **AI Design:** `docs/AI_DESIGN.md`
- **UI Spec:** `docs/UI_SPEC_UO_STYLE.md`
- **Tasks:** `docs/task.md` (index), `docs/tasks/*.md` (individual tasks)

---

## Need Help?

- Check `dev-help` for command reference
- Run `dev-status` to verify setup
- See `.codex/CODEX_EXECUTION_GUIDE.md` for task generation guide
- Review `docs/CROSS_REFERENCE_ANALYSIS.md` for project structure
