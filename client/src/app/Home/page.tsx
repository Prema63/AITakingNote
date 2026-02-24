"use client";

import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { INITIAL_NOTES, Note } from "../components/notes/notesData";
import NotesGrid from "../components/notes/NotesGrid";
import NewNoteModal from "../components/notes/NewNoteModal";
import FilterBar from "../components/notes/FilterBar";
import StatsStrip from "../components/notes/StatsStrip";


export default function HomePage() {
  const { dark } = useTheme(); // ✅ use context
  const [notes, setNotes] = useState<Note[]>(INITIAL_NOTES);
  const [filter, setFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);

  const filtered =
    filter === "All" ? notes : notes.filter((n) => n.tag === filter);

  return (
    <div
      className={`min-h-screen transition-colors ${dark ? "bg-[#0f0f12] text-white" : "bg-[#f5f3ef] text-black"
        }`}
    >

      {modalOpen && (
        <NewNoteModal
          onClose={() => setModalOpen(false)}
          onSave={(title) =>
            setNotes((prev) => [
              {
                id: Date.now(),
                title,
                preview: "New note...",
                date: "Today",
                tag: "Work",
                tagColor: "bg-blue-500/20 text-blue-400",
                pinned: false,
                starred: false,
                wordCount: 0,
                icon: () => null,
              },
              ...prev,
            ])
          }
        />
      )}

      <div className="max-w-screen-xl mx-auto px-6 py-8 flex gap-8">
        <div className="flex-1">
          <StatsStrip notes={notes} dark={dark} />
          <FilterBar activeFilter={filter} setFilter={setFilter} dark={dark} />
          <NotesGrid
            notes={filtered}
            dark={dark}
            onDelete={(id) =>
              setNotes((prev) => prev.filter((n) => n.id !== id))
            }
          />
        </div>
      </div>
    </div>
  );
}