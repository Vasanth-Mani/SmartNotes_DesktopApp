import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  TextField,
  Box,
  Typography,
} from '@mui/material';
import {
  Edit,
  Delete,
  Add,
  Check,
  Close,
} from '@mui/icons-material';
import type { Category } from '../types';

interface CategoryManagerProps {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  onAdd: (name: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string, action: 'move' | 'delete') => void;
}

export default function CategoryManager({
  open,
  onClose,
  categories,
  onAdd,
  onRename,
  onDelete,
}: CategoryManagerProps) {
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const handleAdd = () => {
    if (newName.trim()) {
      onAdd(newName.trim());
      setNewName('');
    }
  };

  const handleStartEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
  };

  const handleSaveEdit = () => {
    if (editingId && editName.trim()) {
      onRename(editingId, editName.trim());
    }
    setEditingId(null);
    setEditName('');
  };

  const handleDelete = (action: 'move' | 'delete') => {
    if (deleteTarget) {
      onDelete(deleteTarget.id, action);
      setDeleteTarget(null);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Manage Categories</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              size="small"
              fullWidth
              label="New category"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd();
              }}
            />
            <IconButton color="primary" onClick={handleAdd} disabled={!newName.trim()}>
              <Add />
            </IconButton>
          </Box>

          {categories.length === 0 ? (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
              No categories yet. Add one above!
            </Typography>
          ) : (
            <List dense>
              {categories.map((cat) => (
                <ListItem key={cat.id} divider>
                  {editingId === cat.id ? (
                    <Box sx={{ display: 'flex', gap: 1, flex: 1, mr: 1 }}>
                      <TextField
                        size="small"
                        fullWidth
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit();
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        autoFocus
                      />
                      <IconButton size="small" onClick={handleSaveEdit} color="primary">
                        <Check fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => setEditingId(null)}>
                        <Close fontSize="small" />
                      </IconButton>
                    </Box>
                  ) : (
                    <>
                      <ListItemText primary={cat.name} />
                      <ListItemSecondaryAction>
                        <IconButton
                          size="small"
                          onClick={() => handleStartEdit(cat)}
                          aria-label="Rename category"
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => setDeleteTarget(cat)}
                          color="error"
                          aria-label="Delete category"
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </>
                  )}
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Done</Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
      >
        <DialogTitle>Delete Category &quot;{deleteTarget?.name}&quot;</DialogTitle>
        <DialogContent>
          <Typography>
            What would you like to do with the notes in this category?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button onClick={() => handleDelete('move')} variant="outlined">
            Move to Uncategorized
          </Button>
          <Button
            onClick={() => handleDelete('delete')}
            color="error"
            variant="contained"
          >
            Delete All Notes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
