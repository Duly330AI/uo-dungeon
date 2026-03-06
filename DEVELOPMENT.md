# FORD Development Setup

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

This will start the Vite development server, usually on `http://localhost:3000`.

### 3. Build for Production

```bash
npm run build
```

### 4. Preview Production Build

```bash
npm run preview
```

---

## Available Commands

- `npm run dev` - Start the Vite dev server
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint to find and fix problems

---

## Project Structure

- `src/` - Source code (React components, systems, utilities)
- `public/` - Static assets that don't need processing
- `data/` - JSON data files defining game content
- `tests/` - Test files

## Data Validation

Data files in `data/` are the single source of truth for game content. They are validated against schemas during development or build.
