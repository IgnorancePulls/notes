import axios from 'axios';
import { type ReactNode,useCallback, useState } from 'react';

import * as notesApi from '@/services/notesApi';
import type { Note } from '@/types/note';

import { NotesContext } from './notesContext';
import { useToast } from './toastContext';

interface NotesProviderProps {
  children: ReactNode;
}

export function NotesProvider({ children }: NotesProviderProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const { showToast } = useToast();

  const fetchNotes = useCallback(async () => {
    const data = await notesApi.fetchNotes();
    const activeNotes = data.filter((note) => !note.is_deleted);

    setNotes(activeNotes);
  }, []);

  const fetchNoteById = useCallback(async (id: string): Promise<Note | null> => {
    try {
      return await notesApi.fetchNote(id)
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      showToast('Failed to load note', 'error');
      throw error;
    }
  }, [showToast]);

  const createNote = useCallback(async (note: Note) => {
    const newNote = await notesApi.createNote({
      title: note.title,
      text: note.text,
      last_updated_at: new Date(),
      is_deleted: false,
    });
    setNotes((prev) => [newNote, ...prev]);
    return newNote;
  }, []);

  const updateNote = useCallback(async (note: Note) => {
    const updatedNote = await notesApi.updateNote({
      ...note,
      last_updated_at: new Date(),
    });

    setNotes((prev) =>
      prev.map((prevNote) => (prevNote.id === note.id ? updatedNote : prevNote))
    );

    return updatedNote;
  }, []);

  const deleteNote = useCallback(async (note: Note) => {
    await notesApi.deleteNote(note);
    setNotes((prev) => prev.filter((n) => n.id !== note.id));
    showToast('Note deleted', 'success');
  }, [showToast]);

  return (
    <NotesContext.Provider
      value={{
        notes,
        fetchNotes,
        fetchNoteById,
        createNote,
        updateNote,
        deleteNote,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
}
