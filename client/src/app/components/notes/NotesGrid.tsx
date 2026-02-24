"use client";

import NoteCard from "./noteCards";
import { Note } from "./notesData";

export default function NotesGrid({
  notes,
  onDelete,
}: {
  notes: Note[];
  onDelete: (id: number) => void;
}) {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} onDelete={onDelete} />
      ))}
    </div>
  );
}