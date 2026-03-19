import { useState, useMemo, useRef, useEffect } from 'react';
import {
  TextField,
  Paper,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  InputAdornment,
  Popper,
  ClickAwayListener,
  Box,
  Chip,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import type { Category, Note } from '../types';
import { searchNotes, type SearchResult } from '../utils';

interface SearchBarProps {
  notes: Note[];
  categories: Category[];
  onSelect: (result: SearchResult) => void;
}

export default function SearchBar({ notes, categories, onSelect }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const [selectedIdx, setSelectedIdx] = useState(-1);

  const results = useMemo(() => {
    if (query.trim().length < 1) return [];
    return searchNotes(query, notes, categories).slice(0, 20);
  }, [query, notes, categories]);

  useEffect(() => {
    setSelectedIdx(-1);
  }, [results]);

  const grouped = useMemo(() => {
    const map = new Map<string, SearchResult[]>();
    for (const r of results) {
      const key = r.categoryName;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }
    return map;
  }, [results]);

  const handleSelect = (result: SearchResult) => {
    onSelect(result);
    setQuery('');
    setOpen(false);
  };

  const flatResults = results;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx((prev) => Math.min(prev + 1, flatResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && selectedIdx >= 0 && selectedIdx < flatResults.length) {
      e.preventDefault();
      handleSelect(flatResults[selectedIdx]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <Box sx={{ position: 'relative', width: { xs: '100%', sm: 320 } }}>
        <TextField
          ref={anchorRef}
          size="small"
          placeholder="Search notes..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            if (query.trim()) setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'inherit', opacity: 0.7 }} />
                </InputAdornment>
              ),
              sx: {
                bgcolor: 'rgba(255,255,255,0.15)',
                borderRadius: 2,
                color: 'inherit',
                '& fieldset': { border: 'none' },
                '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
              },
            },
          }}
          sx={{ width: '100%' }}
          aria-label="Search notes"
          role="combobox"
          aria-expanded={open && results.length > 0}
        />
        <Popper
          open={open && results.length > 0}
          anchorEl={anchorRef.current}
          placement="bottom-start"
          style={{ zIndex: 1300, width: anchorRef.current?.offsetWidth || 320 }}
        >
          <Paper
            elevation={8}
            sx={{ maxHeight: 400, overflow: 'auto', mt: 0.5 }}
          >
            <List dense>
              {[...grouped.entries()].map(([catName, items]) => (
                <Box key={catName}>
                  <Typography
                    variant="overline"
                    sx={{ px: 2, pt: 1, display: 'block', color: 'text.secondary' }}
                  >
                    {catName}
                  </Typography>
                  {items.map((result) => {
                    const idx = flatResults.indexOf(result);
                    return (
                      <ListItemButton
                        key={result.noteId}
                        selected={idx === selectedIdx}
                        onClick={() => handleSelect(result)}
                      >
                        <ListItemText
                          primary={result.question}
                          secondary={
                            result.matchField !== 'question' ? (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                noWrap
                              >
                                {result.snippet}
                              </Typography>
                            ) : null
                          }
                        />
                        <Chip
                          label={result.matchField}
                          size="small"
                          variant="outlined"
                          sx={{ ml: 1, flexShrink: 0 }}
                        />
                      </ListItemButton>
                    );
                  })}
                </Box>
              ))}
            </List>
          </Paper>
        </Popper>
      </Box>
    </ClickAwayListener>
  );
}
