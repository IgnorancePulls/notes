import { DocumentTextIcon,PlusIcon } from '@heroicons/react/24/outline';
import { useEffect,useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ErrorPage } from "@/components/ErrorPage";
import { Spinner } from '@/components/Spinner';

import { ConfirmModal } from '@/components/ConfirmModal';
import { NoteCard } from '@/components/NoteCard';
import { useNotes } from '@/context/notesContext';
import type { Note } from '@/types/note';

export function HomePage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { notes, fetchNotes, deleteNote } = useNotes();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);

  const handleDelete = (note: Note) => {
    setNoteToDelete(note);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (noteToDelete) {
      await deleteNote(noteToDelete);
      setNoteToDelete(null);
    }
  };

  useEffect(() => {
    const loadNotes = async () => {
        setIsLoading(true);
        setHasError(false);
        try {
            await fetchNotes();
        } catch {
            setHasError(true);
        } finally {
            setIsLoading(false);
        }
    }
    loadNotes();
  }, [fetchNotes]);

  if (isLoading) {
    return <Spinner/>
  }

  if (hasError) {
    return <ErrorPage />
  }

  return (
    <div className="min-h-screen p-6 max-w-6xl mx-auto">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Notes</h1>
        <button
          onClick={() => navigate('/edit/new')}
          className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          New Note
        </button>
      </header>

      {notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <DocumentTextIcon className="w-16 h-16 mb-4" />
          <p className="text-xl">No notes yet. Create one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={() => navigate(`/edit/${note.id}`)}
              onDelete={() => handleDelete(note)}
            />
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Note?"
        message="This action cannot be undone."
      />
    </div>
  );
}
