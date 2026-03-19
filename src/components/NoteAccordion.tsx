import { useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  IconButton,
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import {
  ExpandMore,
  Edit,
  Delete,
} from '@mui/icons-material';
import type { Note } from '../types';

interface NoteAccordionProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  expanded: boolean;
  onToggle: () => void;
  highlighted?: boolean;
  scrollRef?: React.RefObject<HTMLDivElement | null>;
}

export default function NoteAccordion({
  note,
  onEdit,
  onDelete,
  expanded,
  onToggle,
  highlighted,
  scrollRef,
}: NoteAccordionProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <Accordion
        ref={scrollRef}
        expanded={expanded}
        onChange={onToggle}
        sx={{
          mb: 1,
          borderRadius: '8px !important',
          '&:before': { display: 'none' },
          border: highlighted ? 2 : 0,
          borderColor: 'primary.main',
          transition: 'border-color 0.3s ease',
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMore />}
          sx={{
            '& .MuiAccordionSummary-content': {
              alignItems: 'center',
              gap: 1,
              overflow: 'hidden',
            },
          }}
        >
          <Typography
            sx={{
              fontWeight: 600,
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {note.question}
          </Typography>
          {note.tags.length > 0 && (
            <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0, mr: 1 }}>
              {note.tags.slice(0, 3).map((tag) => (
                <Chip key={tag} label={tag} size="small" variant="outlined" />
              ))}
            </Box>
          )}
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(note);
            }}
            aria-label="Edit note"
          >
            <Edit fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteOpen(true);
            }}
            aria-label="Delete note"
            color="error"
          >
            <Delete fontSize="small" />
          </IconButton>
        </AccordionSummary>
        <AccordionDetails>
          <Box
            className="note-answer-content"
            sx={{
              '& pre': {
                background: '#1e1e1e',
                color: '#d4d4d4',
                borderRadius: 1,
                p: 2,
                fontFamily: '"Fira Code", "Consolas", monospace',
                fontSize: 14,
                overflowX: 'auto',
                '& code': {
                  background: 'none',
                  color: 'inherit',
                  fontSize: 'inherit',
                  p: 0,
                },
              },
              '& code': {
                background: (theme) =>
                  theme.palette.mode === 'dark' ? '#333' : '#f5f5f5',
                borderRadius: 0.5,
                px: 0.5,
                py: 0.25,
                fontFamily: '"Fira Code", "Consolas", monospace',
                fontSize: '0.9em',
              },
              '& blockquote': {
                borderLeft: 3,
                borderColor: 'primary.main',
                pl: 2,
                ml: 0,
                fontStyle: 'italic',
              },
              '& img': {
                maxWidth: '100%',
                height: 'auto',
                borderRadius: 1,
                my: 1,
              },
            }}
            dangerouslySetInnerHTML={{ __html: note.answer }}
          />
        </AccordionDetails>
      </Accordion>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Delete Note</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete &quot;{note.question}&quot;? This
            action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              onDelete(note.id);
              setDeleteOpen(false);
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
