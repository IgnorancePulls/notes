import type { Note, NoteResponse } from '@/types/note';

import apiClient from './axios';

export const fetchNotes = async (): Promise<Note[]> => {
  const { data } = await apiClient.get<NoteResponse[]>('/notes');

  return data.map((note: NoteResponse) => ({
    id: note.id,
    ...JSON.parse(note.body),
    last_updated_at: new Date(JSON.parse(note.body).last_updated_at),
  }));
};

export const fetchNote = async (id: string): Promise<Note> => {
  const { data } = await apiClient.get<NoteResponse>(`/notes/${id}`);
  const parsed = JSON.parse(data.body);

  return {
    id: data.id,
    ...parsed,
    last_updated_at: new Date(parsed.last_updated_at),
  };
};

export const createNote = async (note: Omit<Note, 'id'>): Promise<Note> => {
  const encodedNote = JSON.stringify({
    ...note,
    last_updated_at: note.last_updated_at?.toISOString() ?? new Date().toISOString(),
  });

  const { data } = await apiClient.post<NoteResponse>('/notes', {
    body: encodedNote,
  });

  const parsed = JSON.parse(data.body);
  return {
    id: data.id,
    ...parsed,
    last_updated_at: new Date(parsed.last_updated_at),
  };
};

export const updateNote = async (note: Note): Promise<Note> => {
  const { id, ...rest } = note;
  const encodedNote = JSON.stringify({
    ...rest,
    last_updated_at: rest.last_updated_at?.toISOString() ?? new Date().toISOString(),
  });

  const { data } = await apiClient.put<NoteResponse>(`/notes/${id}`, {
    body: encodedNote,
  });

  const parsed = JSON.parse(data.body);
  return {
    id: data.id,
    ...parsed,
    last_updated_at: new Date(parsed.last_updated_at),
  };
};

export const deleteNote = async (note: Note): Promise<void> => {
  const { id, ...rest } = note;

  const encodedNote = JSON.stringify({
    ...rest,
    last_updated_at: rest.last_updated_at?.toISOString() ?? new Date().toISOString(),
    is_deleted: true,
  });

  await apiClient.put(`/notes/${id}`, {
    body: encodedNote,
  });
};
