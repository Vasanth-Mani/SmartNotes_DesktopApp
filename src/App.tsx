import { useState, useMemo, useCallback, createRef, useEffect, useRef } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Tabs,
  Tab,
  Fab,
  Box,
  Container,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Add,
  DarkMode,
  LightMode,
  Settings,
  NoteAdd,
} from '@mui/icons-material';
import { useCategories, useNotes } from './hooks';
import {
  NoteDialog,
  NoteAccordion,
  CategoryManager,
  SearchBar,
  ExportMenu,
} from './components';
import type { Note } from './types';
import type { SearchResult } from './utils';

interface AppProps {
  toggleTheme: () => void;
  isDark: boolean;
}

export default function App({ toggleTheme, isDark }: AppProps) {
  const {
    categories,
    addCategory,
    renameCategory,
    deleteCategory,
  } = useCategories();
  const [activeTab, setActiveTab] = useState(0);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [categoryManagerOpen, setCategoryManagerOpen] = useState(false);
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);
  const [highlightedNoteId, setHighlightedNoteId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({ open: false, message: '', severity: 'info' });

  const activeCategory = categories[activeTab] || null;

  const { notes, allNotes, addNote, updateNote, deleteNote } = useNotes(
    activeCategory?.id,
  );

  const noteRefs = useRef<Map<string, React.RefObject<HTMLDivElement | null>>>(new Map());

  // Get or create a ref for a note
  const getNoteRef = useCallback((noteId: string) => {
    if (!noteRefs.current.has(noteId)) {
      noteRefs.current.set(noteId, createRef<HTMLDivElement>());
    }
    return noteRefs.current.get(noteId)!;
  }, []);

  const handleSaveNote = async (data: {
    categoryId: string;
    question: string;
    answer: string;
    tags: string[];
  }) => {
    try {
      if (editingNote) {
        await updateNote(editingNote.id, data);
        showSnackbar('Note updated!', 'success');
      } else {
        await addNote(data);
        showSnackbar('Note created!', 'success');
      }
    } catch {
      showSnackbar('Failed to save note', 'error');
    }
    setEditingNote(null);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setNoteDialogOpen(true);
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await deleteNote(id);
      showSnackbar('Note deleted', 'info');
    } catch {
      showSnackbar('Failed to delete note', 'error');
    }
  };

  const handleSearchSelect = useCallback(
    (result: SearchResult) => {
      // Navigate to the category tab
      const catIndex = categories.findIndex((c) => c.id === result.categoryId);
      if (catIndex >= 0) {
        setActiveTab(catIndex);
      }
      // Expand and highlight the note
      setExpandedNoteId(result.noteId);
      setHighlightedNoteId(result.noteId);
      // Scroll to note after tab switch
      setTimeout(() => {
        const ref = noteRefs.current.get(result.noteId);
        ref?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 200);
      // Remove highlight after a few seconds
      setTimeout(() => setHighlightedNoteId(null), 3000);
    },
    [categories],
  );

  const handleAddCategory = async (name: string) => {
    await addCategory(name);
    showSnackbar(`Category "${name}" added`, 'success');
  };

  const handleRenameCategory = async (id: string, name: string) => {
    await renameCategory(id, name);
  };

  const handleDeleteCategory = async (
    id: string,
    action: 'move' | 'delete',
  ) => {
    await deleteCategory(id, action);
    setActiveTab(0);
    showSnackbar('Category deleted', 'info');
  };

  const showSnackbar = (
    message: string,
    severity: 'success' | 'error' | 'info',
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  // Ensure tab index is valid
  const safeTabIndex = useMemo(() => {
    if (categories.length === 0) return 0;
    return Math.min(activeTab, categories.length - 1);
  }, [activeTab, categories.length]);

  useEffect(() => {
    if (safeTabIndex !== activeTab) {
      setActiveTab(safeTabIndex);
    }
  }, [safeTabIndex, activeTab]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* AppBar */}
      <AppBar position="sticky" elevation={2}>
        <Toolbar sx={{ gap: 1, flexWrap: 'wrap' }}>
          <NoteAdd sx={{ mr: 1 }} />
          <Typography
            variant="h6"
            component="h1"
            sx={{
              fontWeight: 700,
              mr: 2,
              display: { xs: 'none', sm: 'block' },
            }}
          >
            SmartNotes
          </Typography>

          <SearchBar
            notes={allNotes}
            categories={categories}
            onSelect={handleSearchSelect}
          />

          <Box sx={{ flex: 1 }} />

          <ExportMenu categories={categories} notes={allNotes} />

          <Tooltip title="Manage Categories">
            <IconButton color="inherit" onClick={() => setCategoryManagerOpen(true)}>
              <Settings />
            </IconButton>
          </Tooltip>

          <Tooltip title={isDark ? 'Light Mode' : 'Dark Mode'}>
            <IconButton color="inherit" onClick={toggleTheme}>
              {isDark ? <LightMode /> : <DarkMode />}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Category Tabs */}
      {categories.length > 0 && (
        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Tabs
            value={safeTabIndex}
            onChange={(_, v) => {
              setActiveTab(v);
              setExpandedNoteId(null);
            }}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="Category tabs"
          >
            {categories.map((cat) => (
              <Tab key={cat.id} label={cat.name} />
            ))}
          </Tabs>
        </Box>
      )}

      {/* Main Content */}
      <Container maxWidth="md" sx={{ flex: 1, py: 3 }}>
        {categories.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 10,
              gap: 2,
            }}
          >
            <Typography variant="h5" color="text.secondary" gutterBottom>
              Welcome to SmartNotes!
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
              Start by creating a category, then add your programming Q&amp;A notes.
            </Typography>
            <Fab
              variant="extended"
              color="primary"
              onClick={() => setCategoryManagerOpen(true)}
            >
              <Add sx={{ mr: 1 }} />
              Add Your First Category
            </Fab>
          </Box>
        ) : notes.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 10,
              gap: 2,
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No notes in &quot;{activeCategory?.name}&quot; yet
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              Click the + button to add your first note!
            </Typography>
          </Box>
        ) : (
          notes.map((note) => (
            <NoteAccordion
              key={note.id}
              note={note}
              onEdit={handleEditNote}
              onDelete={handleDeleteNote}
              expanded={expandedNoteId === note.id}
              onToggle={() =>
                setExpandedNoteId(
                  expandedNoteId === note.id ? null : note.id,
                )
              }
              highlighted={highlightedNoteId === note.id}
              scrollRef={getNoteRef(note.id)}
            />
          ))
        )}
      </Container>

      {/* FAB */}
      {categories.length > 0 && (
        <Fab
          color="primary"
          aria-label="Add note"
          onClick={() => {
            setEditingNote(null);
            setNoteDialogOpen(true);
          }}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
          }}
        >
          <Add />
        </Fab>
      )}

      {/* Note Dialog */}
      <NoteDialog
        open={noteDialogOpen}
        onClose={() => {
          setNoteDialogOpen(false);
          setEditingNote(null);
        }}
        onSave={handleSaveNote}
        categories={categories}
        note={editingNote}
        defaultCategoryId={activeCategory?.id}
      />

      {/* Category Manager */}
      <CategoryManager
        open={categoryManagerOpen}
        onClose={() => setCategoryManagerOpen(false)}
        categories={categories}
        onAdd={handleAddCategory}
        onRename={handleRenameCategory}
        onDelete={handleDeleteCategory}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
