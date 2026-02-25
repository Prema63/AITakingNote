"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "../context/ThemeContext";
import {
  X,
  PenLine,
  Briefcase,
  User,
  Code2,
  Palette,
  BookOpen,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Hash,
  Quote,
  Pin,
  Star,
  Smile,
  ImagePlus,
  Link2,
  Minus,
  CheckSquare,
  ChevronDown,
  Sparkles,
  AlignLeft,
  AlignCenter,
  LucideIcon,
} from "lucide-react";


interface NoteType {
  id: string;
  label: string;
  Icon: LucideIcon;
  accent: string;          // text color
  accentBg: string;        // bg color (subtle)
  accentRing: string;      // ring/border color
  accentSolid: string;     // solid bg for selected pill
}

interface NoteIcon {
  id: string;
  Icon: LucideIcon;
  label: string;
}

export interface NewNote {
  title: string;
  description: string;
  type: string;
  icon: string;
  pinned: boolean;
  starred: boolean;
}

interface AddNoteModalProps {
  onClose: () => void;
  onSave: (note: NewNote) => void;
}

const NOTE_TYPES: NoteType[] = [
  {
    id: "work",
    label: "Work",
    Icon: Briefcase,
    accent: "text-blue-400",
    accentBg: "bg-blue-500/10",
    accentRing: "border-blue-500/40",
    accentSolid: "bg-blue-500",
  },
  {
    id: "personal",
    label: "Personal",
    Icon: User,
    accent: "text-emerald-400",
    accentBg: "bg-emerald-500/10",
    accentRing: "border-emerald-500/40",
    accentSolid: "bg-emerald-500",
  },
  {
    id: "dev",
    label: "Dev",
    Icon: Code2,
    accent: "text-violet-400",
    accentBg: "bg-violet-500/10",
    accentRing: "border-violet-500/40",
    accentSolid: "bg-violet-500",
  },
  {
    id: "design",
    label: "Design",
    Icon: Palette,
    accent: "text-pink-400",
    accentBg: "bg-pink-500/10",
    accentRing: "border-pink-500/40",
    accentSolid: "bg-pink-500",
  },
  {
    id: "journal",
    label: "Journal",
    Icon: BookOpen,
    accent: "text-amber-400",
    accentBg: "bg-amber-500/10",
    accentRing: "border-amber-500/40",
    accentSolid: "bg-amber-500",
  },
];

const NOTE_ICONS: NoteIcon[] = [
  { id: "pen",      Icon: PenLine,      label: "Pen"      },
  { id: "work",     Icon: Briefcase,    label: "Work"     },
  { id: "code",     Icon: Code2,        label: "Code"     },
  { id: "design",   Icon: Palette,      label: "Design"   },
  { id: "book",     Icon: BookOpen,     label: "Book"     },
  { id: "list",     Icon: List,         label: "List"     },
  { id: "hash",     Icon: Hash,         label: "Tag"      },
  { id: "star",     Icon: Star,         label: "Star"     },
  { id: "smile",    Icon: Smile,        label: "Mood"     },
  { id: "image",    Icon: ImagePlus,    label: "Image"    },
  { id: "link",     Icon: Link2,        label: "Link"     },
  { id: "check",    Icon: CheckSquare,  label: "Task"     },
];

const FORMAT_TOOLS = [
  { Icon: Bold,         label: "Bold",          shortcut: "⌘B" },
  { Icon: Italic,       label: "Italic",        shortcut: "⌘I" },
  { Icon: Underline,    label: "Underline",     shortcut: "⌘U" },
  { Icon: Minus,        label: "Divider",       shortcut: ""   },
  { Icon: Hash,         label: "Heading",       shortcut: ""   },
  { Icon: Quote,        label: "Quote",         shortcut: ""   },
  { Icon: List,         label: "Bullet List",   shortcut: ""   },
  { Icon: ListOrdered,  label: "Numbered List", shortcut: ""   },
  { Icon: CheckSquare,  label: "Checklist",     shortcut: ""   },
  { Icon: Minus,        label: "Divider",       shortcut: ""   },
  { Icon: Link2,        label: "Link",          shortcut: "⌘K" },
  { Icon: ImagePlus,    label: "Image",         shortcut: ""   },
  { Icon: AlignLeft,    label: "Align Left",    shortcut: ""   },
  { Icon: AlignCenter,  label: "Align Center",  shortcut: ""   },
];

// ══════════════════════════════════════════════════════════════════
// WORD COUNT
// ══════════════════════════════════════════════════════════════════
function wordCount(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

// ══════════════════════════════════════════════════════════════════
// MODAL
// ══════════════════════════════════════════════════════════════════
export default function AddNoteModal({ onClose, onSave }: AddNoteModalProps) {
  const { dark } = useTheme();

  const [title, setTitle]           = useState("");
  const [description, setDescription] = useState("");
  const [selectedType, setType]     = useState<NoteType>(NOTE_TYPES[0]);
  const [selectedIcon, setIcon]     = useState<NoteIcon>(NOTE_ICONS[0]);
  const [pinned, setPinned]         = useState(false);
  const [starred, setStarred]       = useState(false);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [typeDropOpen, setTypeDropOpen]     = useState(false);
  const [titleError, setTitleError] = useState("");
  const [activeFormat, setActiveFormat] = useState<string[]>([]);

  const titleRef   = useRef<HTMLInputElement>(null);
  const iconRef    = useRef<HTMLDivElement>(null);
  const typeRef    = useRef<HTMLDivElement>(null);

  // autofocus title
  useEffect(() => { titleRef.current?.focus(); }, []);

  // Escape to close
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  // close pickers on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (iconRef.current && !iconRef.current.contains(e.target as Node)) setIconPickerOpen(false);
      if (typeRef.current && !typeRef.current.contains(e.target as Node)) setTypeDropOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleSave = () => {
    if (!title.trim()) { setTitleError("Please add a title for your note"); titleRef.current?.focus(); return; }
    onSave({ title: title.trim(), description, type: selectedType.id, icon: selectedIcon.id, pinned, starred });
    onClose();
  };

  const toggleFormat = (label: string) => {
    setActiveFormat(prev => prev.includes(label) ? prev.filter(f => f !== label) : [...prev, label]);
  };

  // ── theme tokens ──
  const bg         = dark ? "bg-[#111013]"          : "bg-[#fafaf8]";
  const modalBg    = dark ? "bg-[#18161c]"          : "bg-white";
  const bdr        = dark ? "border-white/[0.07]"   : "border-black/[0.07]";
  const bdrStrong  = dark ? "border-white/[0.1]"    : "border-black/[0.1]";
  const txt        = dark ? "text-[#ede9e3]"        : "text-[#18160f]";
  const sub        = dark ? "text-[#635f5a]"        : "text-[#a09c97]";
  const surface    = dark ? "bg-white/[0.04]"       : "bg-black/[0.03]";
  const surfaceHov = dark ? "hover:bg-white/[0.07]" : "hover:bg-black/[0.05]";
  const inputBg    = dark ? "bg-[#1e1b22]"          : "bg-[#f5f4f1]";
  const divider    = dark ? "border-white/[0.06]"   : "border-black/[0.06]";
  const dropBg     = dark ? "bg-[#1e1b22] border-white/[0.08]" : "bg-white border-black/[0.09]";

  const words = wordCount(description);
  const chars = description.length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
      style={{ background: dark ? "rgba(5,4,8,0.85)" : "rgba(0,0,0,0.38)", backdropFilter: "blur(14px)" }}
      onClick={onClose}
    >
      <div
        className={`w-full max-w-2xl rounded-[28px] border ${modalBg} ${bdrStrong} flex flex-col overflow-hidden`}
        style={{
          maxHeight: "92vh",
          boxShadow: dark
            ? "0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.06)"
            : "0 40px 100px rgba(0,0,0,0.14), 0 0 0 1px rgba(0,0,0,0.06)",
        }}
        onClick={(e) => e.stopPropagation()}
      >

        {/* ══ HEADER ══ */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${divider} flex-shrink-0`}>
          <div className="flex items-center gap-3">
            {/* Icon picker trigger */}
            <div className="relative" ref={iconRef}>
              <button
                onClick={() => setIconPickerOpen(!iconPickerOpen)}
                className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-150 border ${bdr} ${surface} ${surfaceHov} relative group`}
                style={iconPickerOpen ? { boxShadow: `0 0 0 2px ${dark ? "rgba(232,164,74,0.4)" : "rgba(232,164,74,0.5)"}` } : {}}
                title="Choose icon"
              >
                <selectedIcon.Icon size={18} className={selectedType.accent} />
                <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center ${dark ? "bg-[#18161c]" : "bg-white"} border ${bdr}`}>
                  <ChevronDown size={8} className={sub} />
                </span>
              </button>

              {/* Icon picker dropdown */}
              {iconPickerOpen && (
                <div className={`absolute left-0 top-full mt-2 p-3 rounded-2xl border ${dropBg} shadow-2xl z-20 w-52`}>
                  <p className={`text-[10px] uppercase tracking-widest font-semibold mb-2.5 ${sub}`}>Choose Icon</p>
                  <div className="grid grid-cols-6 gap-1.5">
                    {NOTE_ICONS.map((ni) => (
                      <button
                        key={ni.id}
                        onClick={() => { setIcon(ni); setIconPickerOpen(false); }}
                        title={ni.label}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all
                          ${selectedIcon.id === ni.id
                            ? `${selectedType.accentBg} ${selectedType.accent} ring-1 ${selectedType.accentRing}`
                            : `${surface} ${sub} ${surfaceHov}`
                          }`}
                      >
                        <ni.Icon size={14} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <h2 className={`font-bold text-sm leading-none ${txt}`}>New Note</h2>
              <p className={`text-[11px] mt-0.5 ${sub}`}>{words} words · {chars} chars</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* AI suggest */}
            <button
              title="AI suggestions"
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-medium border ${bdr} ${surface} ${surfaceHov} transition-all`}
            >
              <Sparkles size={12} className="text-[#e8a44a]" />
              <span className={sub}>AI</span>
            </button>

            {/* Pin */}
            <button
              onClick={() => setPinned(!pinned)}
              title={pinned ? "Unpin" : "Pin note"}
              className={`p-2 rounded-xl transition-all ${surfaceHov} ${pinned ? "text-[#e8a44a]" : sub}`}
            >
              <Pin size={15} className={pinned ? "fill-[#e8a44a]" : ""} />
            </button>

            {/* Star */}
            <button
              onClick={() => setStarred(!starred)}
              title={starred ? "Unstar" : "Star note"}
              className={`p-2 rounded-xl transition-all ${surfaceHov} ${starred ? "text-[#e8a44a]" : sub}`}
            >
              <Star size={15} className={starred ? "fill-[#e8a44a]" : ""} />
            </button>

            {/* Close */}
            <button onClick={onClose} className={`p-2 rounded-xl ${surfaceHov} ${sub} transition-colors`}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ══ BODY ══ */}
        <div className="flex-1 overflow-y-auto">

          {/* Title row */}
          <div className="px-6 pt-5 pb-2">
            <input
              ref={titleRef}
              value={title}
              onChange={(e) => { setTitle(e.target.value); if (e.target.value.trim()) setTitleError(""); }}
              placeholder="Note title…"
              className={`w-full bg-transparent outline-none text-[1.6rem] font-bold tracking-tight leading-tight ${txt} placeholder-[#3a3835]`}
              style={{ fontFamily: "'DM Serif Display', 'Playfair Display', Georgia, serif" }}
            />
            {titleError && (
              <p className="text-[11px] text-red-400 mt-1.5 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-red-400 inline-block" />
                {titleError}
              </p>
            )}
          </div>

          {/* Type selector */}
          <div className="px-6 pb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[11px] font-semibold uppercase tracking-widest ${sub} mr-1`}>Type</span>
              {NOTE_TYPES.map((nt) => (
                <button
                  key={nt.id}
                  onClick={() => setType(nt)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150
                    ${selectedType.id === nt.id
                      ? `${nt.accentBg} ${nt.accent} ${nt.accentRing} shadow-sm`
                      : `${surface} ${bdr} ${sub} ${surfaceHov}`
                    }`}
                >
                  <nt.Icon size={12} />
                  {nt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className={`h-px mx-6 ${dark ? "bg-white/[0.05]" : "bg-black/[0.05]"}`} />

          {/* Formatting toolbar */}
          <div className={`flex items-center gap-0.5 px-4 py-2 overflow-x-auto scrollbar-none border-b ${divider} flex-shrink-0`}>
            {FORMAT_TOOLS.map(({ Icon, label, shortcut }, i) => {
              if (label === "Divider") return (
                <div key={`div-${i}`} className={`w-px h-4 mx-1 flex-shrink-0 ${dark ? "bg-white/[0.08]" : "bg-black/[0.08]"}`} />
              );
              const isActive = activeFormat.includes(label);
              return (
                <button
                  key={label}
                  onClick={() => toggleFormat(label)}
                  title={shortcut ? `${label} ${shortcut}` : label}
                  className={`flex-shrink-0 p-1.5 rounded-lg transition-all duration-100
                    ${isActive
                      ? `${selectedType.accentBg} ${selectedType.accent}`
                      : `${sub} ${surfaceHov}`
                    }`}
                >
                  <Icon size={14} />
                </button>
              );
            })}
          </div>

          {/* Description / content area */}
          <div className="px-6 py-4">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={`Start writing your ${selectedType.label.toLowerCase()} note…\n\nTip: Use the toolbar above to format your text, or just write freely.`}
              rows={10}
              className={`w-full bg-transparent outline-none resize-none text-sm leading-7 ${txt} placeholder-[#3a3835]`}
              style={{ fontFamily: "'DM Sans', 'Outfit', sans-serif" }}
            />
          </div>

          {/* Extra meta row */}
          <div className={`mx-6 mb-4 p-4 rounded-2xl border ${bdr} ${surface} flex flex-wrap gap-4`}>
            {/* Selected type badge */}
            <div className="flex items-center gap-2">
              <span className={`text-[11px] uppercase tracking-widest font-semibold ${sub}`}>Category</span>
              <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${selectedType.accentBg} ${selectedType.accent}`}>
                <selectedType.Icon size={11} />
                {selectedType.label}
              </span>
            </div>

            {/* Selected icon badge */}
            <div className="flex items-center gap-2">
              <span className={`text-[11px] uppercase tracking-widest font-semibold ${sub}`}>Icon</span>
              <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${surface} border ${bdr} ${txt}`}>
                <selectedIcon.Icon size={11} />
                {selectedIcon.label}
              </span>
            </div>

            {/* Flags */}
            {(pinned || starred) && (
              <div className="flex items-center gap-2">
                {pinned  && <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#e8a44a]/10 text-[#e8a44a]"><Pin size={10} className="fill-[#e8a44a]" />Pinned</span>}
                {starred && <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#e8a44a]/10 text-[#e8a44a]"><Star size={10} className="fill-[#e8a44a]" />Starred</span>}
              </div>
            )}
          </div>
        </div>

        {/* ══ FOOTER ══ */}
        <div className={`flex items-center justify-between px-6 py-4 border-t ${divider} flex-shrink-0 gap-3`}>
          <div className="flex items-center gap-3">
            <span className={`text-[11px] ${sub} hidden sm:block`}>
              Press <kbd className={`font-mono text-[10px] px-1.5 py-0.5 rounded border ${dark ? "border-white/20 bg-white/5" : "border-black/15 bg-black/5"}`}>Esc</kbd> to discard
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium ${surface} ${surfaceHov} ${txt} border ${bdr} transition-colors`}
            >
              Discard
            </button>
            <button
              onClick={handleSave}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.97]
                ${title.trim()
                  ? `${selectedType.accentSolid} text-white`
                  : `${surface} ${sub} cursor-not-allowed border ${bdr}`
                }`}
              style={title.trim() ? { boxShadow: "0 4px 20px rgba(0,0,0,0.2)" } : {}}
            >
              <PenLine size={14} />
              Save Note
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}