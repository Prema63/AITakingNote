"use client";

import { Note } from "./notesData";

export default function StatsStrip({ notes }: { notes: Note[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
      <div className="p-4 rounded-2xl border bg-white dark:bg-white/5">
        <p className="text-lg font-bold">{notes.length}</p>
        <p className="text-xs text-gray-500">Total Notes</p>
      </div>
    </div>
  );
}