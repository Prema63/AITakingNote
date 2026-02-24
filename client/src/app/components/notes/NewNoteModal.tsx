"use client";

import { useState } from "react";

export default function NewNoteModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (title: string) => void;
}) {
  const [title, setTitle] = useState("");

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#1e1c22] rounded-2xl p-6 w-full max-w-md"
      >
        <h2 className="font-semibold mb-4">New Note</h2>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title..."
          className="w-full border p-2 rounded bg-transparent"
        />

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose}>Cancel</button>
          <button
            onClick={() => {
              onSave(title);
              onClose();
            }}
            className="bg-[#e8a44a] px-4 py-2 rounded text-black font-semibold"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}