"use client";

import { MoreHorizontal, Trash2 } from "lucide-react";
import { Note } from "./notesData";

export default function NoteCard({
  note,
  onDelete,
}: {
  note: Note;
  onDelete: (id: number) => void;
}) {
  const Icon = note.icon;

  return (
    <div className="relative rounded-2xl border bg-white dark:bg-white/5 border-black/10 dark:border-white/10 p-4 hover:shadow-lg transition">
      <div className="flex items-center gap-3">
        {/* <Icon size={18} className={note.tagColor.split(" ")[1]} /> */}
        <h3 className="font-semibold text-sm">{note.title}</h3>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        {note.preview}
      </p>

      <div className="flex justify-between items-center mt-4 text-xs">
        <span className={`px-2 py-0.5 rounded-full ${note.tagColor}`}>
          {note.tag}
        </span>
        <span>{note.date}</span>
      </div>

      <button
        onClick={() => onDelete(note.id)}
        className="absolute top-3 right-3 text-red-400 hover:bg-red-500/10 p-1 rounded"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}