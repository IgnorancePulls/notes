import type { Note } from '@/types/note';

/**
 * Sorts notes by last_updated_at in descending order (newest first).
 * Notes without a last_updated_at value are placed at the end.
 */
export function sortNotesByDate(notes: Note[]): Note[] {
  return notes.sort((a, b) => {
    if (!a.last_updated_at && !b.last_updated_at) return 0;
    if (!a.last_updated_at) return 1;
    if (!b.last_updated_at) return -1;
    return new Date(b.last_updated_at).getTime() - new Date(a.last_updated_at).getTime();
  });
}
