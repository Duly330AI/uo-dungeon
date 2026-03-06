# FORD • CONTRIBUTING.md

Willkommen! Dieses Dokument erklärt, **wie** du an FORD mitarbeitest – vom lokalen Setup über Code-Style & Tests bis zum PR-Prozess. Ziel: **kleine, getestete, deterministische** Beiträge ohne Reibung.

---

## 1) Voraussetzungen & Setup

**Benötigt**

- Python **3.12+** (recommended: via `conda` for version pinning)
- Poetry **≥ 1.8** (or via conda/pip)
- Git **≥ 2.40**
- (optional) Tiled Map Editor

**Projekt klonen & installieren (with Conda)**

```bash
# Create conda environment with Python 3.12
conda create -n ford python=3.12 -y
conda activate ford

# Clone and install
git clone <repo-url> ford
cd ford
pip install poetry
poetry lock
poetry install --no-root
pipx install pre-commit
pre-commit install
