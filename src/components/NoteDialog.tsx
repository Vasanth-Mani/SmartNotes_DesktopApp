import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
} from '@mui/material';
import type { Category, Note } from '../types';
import RichTextEditor from './RichTextEditor';

interface NoteDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    categoryId: string;
    question: string;
    answer: string;
    tags: string[];
  }) => void;
  categories: Category[];
  note?: Note | null;
  defaultCategoryId?: string;
}

export default function NoteDialog({
  open,
  onClose,
  onSave,
  categories,
  note,
  defaultCategoryId,
}: NoteDialogProps) {
  const [categoryId, setCategoryId] = useState(
    note?.categoryId || defaultCategoryId || '',
  );
  const [question, setQuestion] = useState(note?.question || '');
  const [answer, setAnswer] = useState(note?.answer || '');
  const [tags, setTags] = useState<string[]>(note?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<{ question?: string; category?: string }>({});

  const handleSave = () => {
    const newErrors: typeof errors = {};
    if (!question.trim()) newErrors.question = 'Question is required';
    if (!categoryId) newErrors.category = 'Category is required';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSave({ categoryId, question: question.trim(), answer, tags });
    handleClose();
  };

  const handleClose = () => {
    setCategoryId(defaultCategoryId || '');
    setQuestion('');
    setAnswer('');
    setTags([]);
    setTagInput('');
    setErrors({});
    onClose();
  };

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setTagInput('');
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Reset form when note prop changes (for editing)
  const noteId = note?.id;
  const [prevNoteId, setPrevNoteId] = useState(noteId);
  if (noteId !== prevNoteId) {
    setPrevNoteId(noteId);
    setCategoryId(note?.categoryId || defaultCategoryId || '');
    setQuestion(note?.question || '');
    setAnswer(note?.answer || '');
    setTags(note?.tags || []);
    setTagInput('');
    setErrors({});
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="note-dialog-title"
    >
      <DialogTitle id="note-dialog-title">
        {note ? 'Edit Note' : 'Add New Note'}
      </DialogTitle>
      <DialogContent dividers>
        <FormControl
          fullWidth
          margin="normal"
          error={!!errors.category}
          size="small"
        >
          <InputLabel id="cat-label">Category</InputLabel>
          <Select
            labelId="cat-label"
            value={categoryId}
            label="Category"
            onChange={(e) => {
              setCategoryId(e.target.value);
              setErrors((prev) => ({ ...prev, category: undefined }));
            }}
          >
            {categories.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          fullWidth
          margin="normal"
          size="small"
          label="Question"
          required
          value={question}
          onChange={(e) => {
            setQuestion(e.target.value);
            setErrors((prev) => ({ ...prev, question: undefined }));
          }}
          error={!!errors.question}
          helperText={errors.question}
          autoFocus
        />

        <Box sx={{ mt: 1, mb: 1 }}>
          <InputLabel sx={{ mb: 0.5, fontSize: 14 }}>Answer</InputLabel>
          <RichTextEditor content={answer} onChange={setAnswer} />
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 2 }}>
          <TextField
            size="small"
            label="Add tags"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            onBlur={handleAddTag}
            sx={{ flex: 1 }}
          />
        </Box>
        {tags.length > 0 && (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
            {tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                onDelete={() => setTags(tags.filter((t) => t !== tag))}
              />
            ))}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          {note ? 'Update' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
