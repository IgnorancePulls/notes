import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import DOMPurify from 'dompurify';

import type { Note } from '@/types/note.ts';

interface NoteCardProps {
  note: Note;
  onEdit: () => void;
  onDelete: () => void;
}

const NoteCard = ({ note, onEdit, onDelete }: NoteCardProps) => {
  return (
    <div className="group relative bg-white rounded-lg shadow p-4 hover:shadow-lg transition max-h-80 flex flex-col">
      <h3 className="text-lg font-semibold truncate text-gray-900">
        {note.title || 'Untitled'}
      </h3>
      <p className="text-sm text-gray-500 mb-2">
        Last update: {note.last_updated_at ? format(note.last_updated_at, 'MMM d, yyyy') : 'Not saved yet'}
      </p>
      <div
        className="text-gray-700 line-clamp-6 whitespace-pre-wrap overflow-hidden"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(note.text || 'No content') }}
      />
      <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition">
        <button
          onClick={onEdit}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
          aria-label="Edit note"
          data-cy="edit-note-button"
        >
          <PencilIcon className="w-4 h-4 text-gray-600" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 rounded-full bg-gray-100 hover:bg-red-100 transition"
          aria-label="Delete note"
          data-cy="delete-note-button"
        >
          <TrashIcon className="w-4 h-4 text-gray-600 hover:text-red-500" />
        </button>
      </div>
    </div>
  );
}

export { NoteCard };