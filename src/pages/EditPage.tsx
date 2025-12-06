import {
  ArrowLeftIcon,
  ArrowPathIcon,
  CheckIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { debounce } from "lodash";
import { useCallback, useEffect, useMemo,useState } from 'react';
import { useNavigate,useParams } from 'react-router-dom';
import { Spinner } from '@/components/Spinner';

import { ConfirmModal } from '@/components/ConfirmModal';
import { NoteNotFound } from '@/components/NoteNotFound';
import { NOTE_INITIAL_STATE,NOTE_STATUS_NEW } from '@/constants/notes';
import { useNotes } from '@/context/notesContext';
import { useToast } from '@/context/toastContext';
import type { Note } from '@/types/note';

export function EditPage() {
  const { id } = useParams<{ id: string }>();
  const currentNoteId = id || NOTE_STATUS_NEW;
  const navigate = useNavigate();
  const { fetchNoteById, createNote, updateNote, deleteNote } = useNotes();
  const { showToast } = useToast();
  const isNew = id === NOTE_STATUS_NEW;
  const [note, setNote] = useState<Note>(NOTE_INITIAL_STATE);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [loadingNote, setLoadingNote] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadNote = async () => {
      if (isNew) {
        return;
      }

      if (!id) {
        setNotFound(true);
        return;
      }

      setLoadingNote(true);
      try {
        const note = await fetchNoteById(id);

        if (note && !note.is_deleted) {
          setNote(note);
        } else {
          setNotFound(true);
        }
      } catch {
        showToast('Failed to load note', 'error');
        setNotFound(true);
      } finally {
        setLoadingNote(false);
      }
    };

    loadNote();
  }, [id, isNew, fetchNoteById, showToast]);

  const saveNote = useCallback(async (noteToSave: Note) => {
    try {
      setIsSaving(true);
      if (noteToSave.id === NOTE_STATUS_NEW) {
        const newNote = await createNote(noteToSave);
        setNote(newNote);
      } else {
        await updateNote(noteToSave);
      }
    } catch {
      showToast('Failed to save note', 'error');
      throw new Error('Save failed');
    } finally {
      setIsSaving(false);
    }
  }, [createNote, updateNote, showToast]);

  const debouncedAutoSave = useMemo(
    () => debounce(saveNote, 2000),
    [saveNote]
  );

  useEffect(() => {
    return () => {
      debouncedAutoSave.cancel();
    };
  }, [debouncedAutoSave]);

  const handleSave = useCallback(async () => {
    debouncedAutoSave.cancel();
    await saveNote(note);
  }, [note, saveNote, debouncedAutoSave]);

  const handleChange = (field: string, value: string) => {
    const updatedNote = { ...note, [field]: value };
    setNote(updatedNote);
    debouncedAutoSave(updatedNote);
  };

  const handleDelete = async () => {
    if (currentNoteId !== NOTE_STATUS_NEW && note) {
      await deleteNote(note);
    }
    navigate('/');
  };

  const handleBack = async () => {
    if (note?.title || note?.text) {
      await handleSave();
    }
    navigate('/');
  };

  if (loadingNote) {
    return <Spinner/>
  }

  if (notFound) {
    return <NoteNotFound/>
  }

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto">
      <header className="flex items-center justify-between mb-4">
        <button
          onClick={handleBack}
          className="p-2 rounded-full hover:bg-gray-200 transition flex items-center gap-2"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-4">
          {isSaving && (
            <span className="flex items-center gap-2 text-gray-500">
              <ArrowPathIcon className="w-4 h-4 animate-spin" />
              Saving...
            </span>
          )}
          {!isSaving && note?.last_updated_at && (
            <span className="flex items-center gap-2 text-green-600">
              <CheckIcon className="w-4 h-4" />
              Saved at {format(note?.last_updated_at, 'HH:mm')}
            </span>
          )}

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition disabled:opacity-50"
          >
            Save
          </button>

          {currentNoteId !== NOTE_STATUS_NEW && (
            <button
              onClick={() => setDeleteModalOpen(true)}
              className="p-2 rounded-full hover:bg-red-100 transition"
              aria-label="Delete note"
            >
              <TrashIcon className="w-5 h-5 text-gray-600 hover:text-red-500" />
            </button>
          )}
        </div>
      </header>

      <input
        type="text"
        value={note?.title}
        onChange={(e) => handleChange('title', e.target.value)}
        placeholder="Title"
        className="w-full text-2xl font-semibold border-0 border-b border-gray-200 pb-2 mb-4 focus:outline-none focus:border-blue-500 bg-transparent"
      />

      <textarea
        value={note?.text}
        onChange={(e) => handleChange('text', e.target.value)}
        placeholder="Start writing..."
        className="w-full min-h-[400px] resize-none border border-gray-200 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      />

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Note?"
        message="This action cannot be undone."
      />
    </div>
  );
}
