# BrainShake

BrainShake is a local-first brainstorming canvas with no account and no backend. Create notes, text, connections, drawings, and import files directly in the browser.

## Run locally

```bash
npm install
npm run dev
```

To generate the production build:

```bash
npm run build
npm run preview
```

## Features

- Canvas with zoom, pan, grid, multi-selection, movement, and resizing
- Sticky notes, text blocks, images, videos, and sandboxed HTML previews
- Pointer Events pen tool for mouse, touch, and stylus
- Object connectors, duplication, deletion, copy/paste, and undo/redo history
- Keyboard shortcuts, context menu, properties panel, and responsive layout
- Autosave to `localStorage` and `.brainshake.json` export
- File picker and drag-and-drop import
- Static deployment configured for GitHub Pages

Imported assets are stored as Data URLs so images, videos, and HTML previews remain available after reopening the page. Large files can exceed the browser's `localStorage` quota; when that happens, export the board as a `.brainshake.json` backup and re-import large assets when needed.
