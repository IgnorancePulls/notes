import { createContext, useContext } from 'react';

import type { Note } from '@/types/note';

export interface NotesContextValue {
  notes: Note[];
  fetchNotes: () => Promise<void>;
  fetchNoteById: (id: string) => Promise<Note | null>;
  createNote: (note: Note) => Promise<Note>;
  updateNote: (note: Note) => Promise<Note>;
  deleteNote: (note: Note) => Promise<void>;
}

export const NotesContext = createContext<NotesContextValue | null>(null);

export function useNotes() {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
}
