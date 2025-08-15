'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import ListItemIcon from '@mui/material/ListItemIcon';

// Définir le type pour les props de la note
type Note = {
  id: string;
  title: string;
};

export function NoteItem({ note, onClick }: { note: Note, onClick: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: note.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <ListItem
      ref={setNodeRef}
      style={style}
      disablePadding
    >
      <ListItemButton onClick={onClick}>
        <ListItemIcon {...attributes} {...listeners} sx={{ cursor: 'grab' }}>
          <DragHandleIcon />
        </ListItemIcon>
        <ListItemText primary={note.title} />
      </ListItemButton>
    </ListItem>
  );
}
