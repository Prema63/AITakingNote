"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useTheme } from "../context/ThemeContext";
import NotesGrid from "../components/notes/NotesGrid";
import NewNoteModal from "../components/notes/NewNoteModal";
import FilterBar from "../components/notes/FilterBar";
import StatsStrip from "../components/notes/StatsStrip";
import { PenLine, SearchX } from "lucide-react";

// API instance
const api = axios.create({
  baseURL: "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
});

export interface Note {
  note_id: number;
  user_id: string;
  title: string;
  description: string;
  type: string;
  created_at: string;
  updated_at: string;
  id: number;
  preview: string;
  date: string;
  tag: string;
  tagColor: string;
  pinned: boolean;
  starred: boolean;
  wordCount: number;
  icon: any;
}

// ── Helpers
const TAG_COLOR_MAP: Record<string, string> = {
  work:     "bg-blue-500/20 text-blue-400",
  personal: "bg-green-500/20 text-green-400",
  dev:      "bg-purple-500/20 text-purple-400",
  design:   "bg-cyan-500/20 text-cyan-400",
  journal:  "bg-rose-500/20 text-rose-400",
  reading:  "bg-amber-500/20 text-amber-400",
};

function tagColor(type: string) {
  return TAG_COLOR_MAP[type?.toLowerCase()] ?? "bg-gray-500/20 text-gray-400";
}

function capitalise(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "General";
}

function wordCount(text: string) {
  return text?.trim() ? text.trim().split(/\s+/).length : 0;
}

function formatDate(iso: string) {
  const d     = new Date(iso);
  const now   = new Date();
  const diff  = now.getTime() - d.getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)   return "Just now";
  if (hours < 24)  return `Today, ${d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
  if (days  === 1) return "Yesterday";
  if (days  < 7)   return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function toNote(raw: any): Note {
  return {
    note_id:     raw.note_id,
    user_id:     raw.user_id,
    description: raw.description ?? "",
    type:        raw.type ?? "general",
    created_at:  raw.created_at,
    updated_at:  raw.updated_at,
    id:          raw.note_id,
    title:       raw.title,
    preview:     raw.description ?? "",
    date:        formatDate(raw.created_at),
    tag:         capitalise(raw.type ?? "general"),
    tagColor:    tagColor(raw.type ?? ""),
    pinned:      false,
    starred:     false,
    wordCount:   wordCount(raw.description ?? ""),
    icon:        null,
  };
}

// Empty state
function EmptyNotes({ dark, onAdd }: { dark: boolean; onAdd: () => void }) {
  const txt  = dark ? "text-[#ede9e3]" : "text-[#18160f]";
  const sub  = dark ? "text-[#635f5a]" : "text-[#a09c97]";
  const card = dark ? "bg-[#18161c] border-white/[0.07]" : "bg-white border-black/[0.08]";

  return (
    <div className="flex flex-col items-center justify-center py-28 gap-6 text-center select-none">
      {/* Stacked card illustration */}
      <div className="relative w-24 h-24">
        <div className={`absolute inset-0 rotate-6 rounded-2xl border ${card} opacity-40`} />
        <div className={`absolute inset-0 -rotate-3 rounded-2xl border ${card} opacity-70`} />
        <div className={`absolute inset-0 rounded-2xl border ${card} shadow-sm flex items-center justify-center`}>
          <PenLine size={30} className="text-[#e8a44a]" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h3
          className={`text-xl font-bold ${txt}`}
          style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
        >
          No notes yet
        </h3>
        <p className={`text-sm max-w-[260px] leading-relaxed ${sub}`}>
          Start capturing your thoughts, ideas, and tasks — your notes will appear here.
        </p>
      </div>
    </div>
  );
}

function EmptyFiltered({
  dark, filter, onClear,
}: { dark: boolean; filter: string; onClear: () => void }) {
  const txt = dark ? "text-[#ede9e3]" : "text-[#18160f]";
  const sub = dark ? "text-[#635f5a]" : "text-[#a09c97]";
  const btn = dark
    ? "border-white/[0.1] text-[#ede9e3] hover:bg-white/[0.05]"
    : "border-black/[0.1] text-[#18160f] hover:bg-black/[0.04]";

  return (
    <div className="flex flex-col items-center justify-center py-28 gap-5 text-center select-none">
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${dark ? "bg-white/[0.04]" : "bg-black/[0.04]"}`}>
        <SearchX size={26} className={sub} />
      </div>

      <div className="flex flex-col gap-1.5">
        <h3 className={`text-lg font-bold ${txt}`}>
          No <span className="text-[#e8a44a]">{filter}</span> notes
        </h3>
        <p className={`text-sm ${sub}`}>
          You don't have any notes in this category yet.
        </p>
      </div>

      <button
        onClick={onClear}
        className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${btn}`}
      >
        Show all notes
      </button>
    </div>
  );
}

// Main component 
export default function HomePage() {
  const { dark } = useTheme();

  const [notes, setNotes]         = useState<Note[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [filter, setFilter]       = useState("All");
  const [modalOpen, setModalOpen] = useState(false);

  const authUser = (() => {
    if (typeof window === "undefined") return null;
    try { return JSON.parse(localStorage.getItem("user") ?? "null"); } catch { return null; }
  })();

  //Fetch
  const fetchNotes = useCallback(async () => {
    if (!authUser?.user_id) {
      setError("Please log in to view your notes.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res   = await api.get(
        `/api/notes/get-notes/${authUser.user_id}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      const raw: any[] = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
      setNotes(raw.map(toNote));
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
        err?.response?.data?.error ??
        "Failed to load notes."
      );
    } finally {
      setLoading(false);
    }
  }, [authUser?.user_id]);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  const filtered = filter === "All" ? notes : notes.filter((n) => n.tag === filter);

  // Render
  return (
    <div
      className={`min-h-screen transition-colors ${
        dark ? "bg-[#0f0f12] text-white" : "bg-[#f5f3ef] text-black"
      }`}
    >
      {modalOpen && (
        <NewNoteModal
          onClose={() => setModalOpen(false)}
          onSave={async () => {
            setModalOpen(false);
            await fetchNotes();
          }}
        />
      )}

      <div className="max-w-screen-xl mx-auto px-6 py-8 flex gap-8">
        <div className="flex-1">

          {/* ── Loading ── */}
          {loading && (
            <div className="flex items-center justify-center py-28">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-[#e8a44a] border-t-transparent animate-spin" />
                <p className={`text-sm ${dark ? "text-[#635f5a]" : "text-[#a09c97]"}`}>
                  Loading notes…
                </p>
              </div>
            </div>
          )}

          {/* ── Error ── */}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-28 gap-4 text-center">
              <div>
                <p className={`font-semibold ${dark ? "text-[#ede9e3]" : "text-[#18160f]"}`}>
                  {error}
                </p>
                <p className={`text-sm mt-1 ${dark ? "text-[#635f5a]" : "text-[#a09c97]"}`}>
                  {authUser
                    ? "Check your connection and try again."
                    : "Log in from the navbar to continue."}
                </p>
              </div>
              {authUser && (
                <button
                  onClick={fetchNotes}
                  className="px-4 py-2 rounded-xl bg-[#e8a44a] text-[#0f0f12] text-sm font-semibold hover:opacity-90 transition-all"
                >
                  Try again
                </button>
              )}
            </div>
          )}

          {/* ── Loaded ── */}
          {!loading && !error && (
            <>
              {/* Stats & filter — only when there are notes */}
              {notes.length > 0 && (
                <>
                  <StatsStrip notes={notes} dark={dark} />
                  <FilterBar activeFilter={filter} setFilter={setFilter} dark={dark} />
                </>
              )}

              {/* Case 1: no notes in DB at all */}
              {notes.length === 0 && (
                <EmptyNotes dark={dark} onAdd={() => setModalOpen(true)} />
              )}

              {/* Case 2: notes exist but filter returned nothing */}
              {notes.length > 0 && filtered.length === 0 && (
                <EmptyFiltered
                  dark={dark}
                  filter={filter}
                  onClear={() => setFilter("All")}
                />
              )}

              {/* Case 3: notes to render */}
              {filtered.length > 0 && (
                <NotesGrid
                  notes={filtered}
                  dark={dark}
                  onDelete={(id) =>
                    setNotes((prev) => prev.filter((n) => n.id !== id))
                  }
                />
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}