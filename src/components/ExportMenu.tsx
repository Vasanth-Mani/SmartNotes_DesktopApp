import { useRef, useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  FileDownload,
  FileUpload,
  Description,
  DataObject,
} from '@mui/icons-material';
import type { Category, Note } from '../types';
import { exportToTxt, exportToJson, downloadFile, parseImportJson } from '../utils';
import { db } from '../db';

interface ExportMenuProps {
  categories: Category[];
  notes: Note[];
}

export default function ExportMenu({ categories, notes }: ExportMenuProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportTxt = () => {
    const txt = exportToTxt(categories, notes);
    downloadFile(txt, `smartnotes-${Date.now()}.txt`, 'text/plain');
    setAnchorEl(null);
  };

  const handleExportJson = () => {
    const json = exportToJson(categories, notes);
    downloadFile(json, `smartnotes-backup-${Date.now()}.json`, 'application/json');
    setAnchorEl(null);
  };

  const handleImport = () => {
    fileInputRef.current?.click();
    setAnchorEl(null);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = parseImportJson(text);

      await db.transaction('rw', db.categories, db.notes, async () => {
        for (const cat of data.categories) {
          const existing = await db.categories.get(cat.id);
          if (existing) {
            await db.categories.update(cat.id, { name: cat.name, order: cat.order, createdAt: cat.createdAt, updatedAt: cat.updatedAt });
          } else {
            await db.categories.add(cat);
          }
        }
        for (const note of data.notes) {
          const existing = await db.notes.get(note.id);
          if (existing) {
            await db.notes.update(note.id, { categoryId: note.categoryId, question: note.question, answer: note.answer, tags: note.tags, createdAt: note.createdAt, updatedAt: note.updatedAt });
          } else {
            await db.notes.add(note);
          }
        }
      });
      alert(`Imported ${data.categories.length} categories and ${data.notes.length} notes successfully!`);
    } catch {
      alert('Failed to import: Invalid backup file format.');
    }

    // clear input
    e.target.value = '';
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        aria-label="Export & Import"
      >
        <FileDownload />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={handleExportTxt}>
          <ListItemIcon>
            <Description fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export as Text (.txt)</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleExportJson}>
          <ListItemIcon>
            <DataObject fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export as JSON (.json)</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleImport}>
          <ListItemIcon>
            <FileUpload fontSize="small" />
          </ListItemIcon>
          <ListItemText>Import JSON Backup</ListItemText>
        </MenuItem>
      </Menu>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </>
  );
}
