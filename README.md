# SmartNotes - Programming Notes App

An offline-first Programming Notes application in Q&A format, built with React, TypeScript, Material UI, and IndexedDB.

![SmartNotes Screenshot](screenshots/placeholder.png)

## Features

- **Q&A Format**: Organize notes as Question → Answer pairs in expandable accordions
- **Rich Text Editor**: TipTap-powered editor with:
  - Bold, Italic, Underline formatting
  - Headings (H2, H3)
  - Bullet and numbered lists
  - Code blocks with syntax highlighting (via Highlight.js)
  - Inline code
  - Blockquotes
  - Image upload/paste (stored as base64)
  - Links
- **Categories**: Organize notes into tabbed categories (Java, Python, Selenium, etc.)
  - Add, rename, delete categories
  - Delete category with option to move notes or delete all
- **Search**: Instant search with autosuggest across all categories, questions, answers, and tags
  - Grouped suggestions by category
  - Click to navigate to the matching note
  - Keyboard navigation support
- **Export & Import**:
  - Export all notes as plain text (.txt)
  - Export full backup as JSON (.json)
  - Import JSON backup to restore notes
- **Dark Mode**: Toggle between light and dark themes
- **Offline-First**: PWA with service worker for full offline support
- **Persistent Storage**: All data stored in IndexedDB via Dexie.js
- **Responsive**: Works on desktop and mobile

## Quick Start

### Prerequisites

- Node.js 18+ and npm

### Install & Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Run Tests

```bash
npm test
```

## Project Structure

```
src/
├── __tests__/          # Tests
│   └── utils.test.ts
├── components/         # UI Components
│   ├── CategoryManager.tsx   # Category CRUD dialog
│   ├── ExportMenu.tsx        # Export/Import menu
│   ├── NoteAccordion.tsx     # Note accordion display
│   ├── NoteDialog.tsx        # Create/Edit note modal
│   ├── RichTextEditor.tsx    # TipTap rich text editor
│   ├── SearchBar.tsx         # Search with autosuggest
│   └── index.ts
├── db/                 # Database layer
│   ├── database.ts     # Dexie IndexedDB setup
│   └── index.ts
├── hooks/              # React hooks
│   ├── useCategories.ts  # Category CRUD operations
│   ├── useNotes.ts       # Note CRUD operations
│   └── index.ts
├── types/              # TypeScript types
│   └── index.ts
├── utils/              # Utilities
│   └── index.ts        # Export, search, helpers
├── App.tsx             # Main application
├── main.tsx            # Entry point with theme
└── index.css           # Global styles
```

## Data Model

### Category
```typescript
{
  id: string;
  name: string;
  order: number;
  createdAt: number;
  updatedAt: number;
}
```

### Note
```typescript
{
  id: string;
  categoryId: string;
  question: string;
  answer: string;         // HTML from TipTap
  tags: string[];
  createdAt: number;
  updatedAt: number;
}
```

## Storage

All data is stored locally in IndexedDB using Dexie.js. Notes and categories persist across browser restarts. Embedded images are stored as base64 data URLs within the answer HTML.

## Export / Import

- **Export TXT**: Produces a human-readable text file with all categories and notes (HTML stripped)
- **Export JSON**: Full structured backup including rich text HTML and embedded images
- **Import JSON**: Restores from a previously exported JSON backup. Existing notes with the same ID are updated; new ones are added.

## Editor Features

The rich text editor supports:
- **Text formatting**: Bold (Ctrl+B), Italic (Ctrl+I), Underline (Ctrl+U)
- **Headings**: H2, H3
- **Lists**: Bullet and numbered
- **Code**: Inline code and code blocks with syntax highlighting
- **Images**: Upload from file dialog or paste from clipboard
- **Links**: Add URLs to selected text
- **Blockquotes**: Indented quote blocks

## Tech Stack

- **React 19** + **TypeScript**
- **Vite** - Build tool
- **Material UI (MUI) 6** - UI components
- **TipTap** - Rich text editor
- **Dexie.js** - IndexedDB wrapper
- **Highlight.js** - Syntax highlighting
- **vite-plugin-pwa** - PWA/Service Worker support
- **Vitest** - Testing

## License

MIT
