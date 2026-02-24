"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "../context/ThemeContext";
import {
  Search,
  Moon,
  Sun,
  PenLine,
  Bell,
  LayoutGrid,
  List,
  X,
  Menu,
  User,
  LogOut,
  Settings,
  Tag,
  Pin,
  Trash2,
  Clock,
  LucideIcon,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────
interface KbdHintProps {
  keys: string[];
}
interface ViewOption {
  mode: "grid" | "list";
  Icon: LucideIcon;
}
interface RecentSearch {
  label: string;
  Icon: LucideIcon;
}
interface DropdownItem {
  label: string;
  Icon: LucideIcon;
}

// ── Keyboard shortcut hint ─────────────────────────────────────────────────
const KbdHint = ({ keys }: KbdHintProps) => (
  <span className="hidden sm:flex items-center gap-1 text-[10px] font-mono opacity-40">
    {keys.map((k, i) => (
      <kbd key={i} className="px-1 py-0.5 rounded border border-current bg-transparent">
        {k}
      </kbd>
    ))}
  </span>
);

// ── Navbar ─────────────────────────────────────────────────────────────────
export default function Navbar() {
  // ← theme state lives in context, affects the whole page
  const { dark, toggleTheme } = useTheme();

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [profileOpen, setProfileOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [notifCount] = useState<number>(3);

  const searchRef = useRef<HTMLInputElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // ⌘K / Ctrl+K → open search, Escape → close overlays
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchRef.current?.focus(), 50);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setProfileOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Theme tokens (driven by global `dark`) ──
  const bg         = dark ? "bg-[#0f0f12]"         : "bg-[#faf9f7]";
  const border     = dark ? "border-white/[0.07]"   : "border-black/[0.07]";
  const text       = dark ? "text-[#e8e6e0]"        : "text-[#1a1916]";
  const sub        = dark ? "text-[#6b6862]"        : "text-[#9a9690]";
  const surface    = dark ? "bg-white/[0.05]"       : "bg-black/[0.04]";
  const surfaceHov = dark ? "hover:bg-white/[0.08]" : "hover:bg-black/[0.07]";
  const accent     = "text-[#e8a44a]";
  const accentBg   = "bg-[#e8a44a]";
  const inputBg    = dark ? "bg-[#1a1916] border-white/[0.08]" : "bg-white border-black/[0.1]";
  const dropdownBg = dark ? "bg-[#17161a] border-white/[0.08]" : "bg-white border-black/[0.1]";
  const divider    = dark ? "border-white/[0.06]"   : "border-black/[0.06]";

  const openSearch = () => {
    setSearchOpen(true);
    setTimeout(() => searchRef.current?.focus(), 50);
  };

  const viewOptions: ViewOption[] = [
    { mode: "grid", Icon: LayoutGrid },
    { mode: "list", Icon: List },
  ];

  const recentSearches: RecentSearch[] = [
    { label: "Meeting notes — Q2",   Icon: Clock },
    { label: "Design system tokens", Icon: Tag   },
    { label: "Book recommendations", Icon: Pin   },
  ];

  const dropdownItems: DropdownItem[] = [
    { label: "Profile",  Icon: User     },
    { label: "Settings", Icon: Settings },
    { label: "Tags",     Icon: Tag      },
    { label: "Trash",    Icon: Trash2   },
  ];

  return (
    <>
      {/* ── Search Overlay ── */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4"
          style={{
            background: dark ? "rgba(0,0,0,0.75)" : "rgba(0,0,0,0.35)",
            backdropFilter: "blur(8px)",
          }}
          onClick={() => setSearchOpen(false)}
        >
          <div
            className={`w-full max-w-xl rounded-2xl border ${
              dark ? "bg-[#17161a] border-white/[0.1]" : "bg-white border-black/[0.1]"
            } shadow-2xl overflow-hidden`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`flex items-center gap-3 px-5 py-4 border-b ${divider}`}>
              <Search size={18} className={sub} />
              <input
                ref={searchRef}
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes, tags, folders…"
                className={`flex-1 bg-transparent outline-none text-base ${text} placeholder-[#6b6862]`}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className={`${sub} transition-colors`}>
                  <X size={18} />
                </button>
              )}
              <kbd className={`hidden sm:block text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                dark ? "border-white/20 text-white/30" : "border-black/20 text-black/30"
              }`}>
                Esc
              </kbd>
            </div>

            <div className="p-3">
              {searchQuery === "" ? (
                <>
                  <p className={`text-[11px] uppercase tracking-widest font-semibold px-3 mb-2 ${sub}`}>
                    Recent searches
                  </p>
                  {recentSearches.map(({ label, Icon }, i) => (
                    <button
                      key={i}
                      className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl ${surfaceHov} transition-colors`}
                    >
                      <Icon size={15} className={sub} />
                      <span className={`text-sm ${text}`}>{label}</span>
                    </button>
                  ))}
                </>
              ) : (
                <>
                  <p className={`text-[11px] uppercase tracking-widest font-semibold px-3 mb-2 ${sub}`}>
                    Results for &ldquo;{searchQuery}&rdquo;
                  </p>
                  <p className={`px-3 py-3 text-sm ${sub}`}>No results yet — keep typing…</p>
                </>
              )}
            </div>

            <div className={`flex items-center justify-between px-5 py-3 border-t ${divider}`}>
              <span className={`text-[11px] ${sub}`}>Press <kbd className="font-mono">↵</kbd> to open</span>
              <span className={`text-[11px] ${sub}`}><kbd className="font-mono">⌘K</kbd> to toggle</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Navbar ── */}
      <nav
        className={`${bg} ${text} border-b ${border} sticky top-0 z-40 transition-colors duration-300`}
        style={{ fontFamily: "'DM Sans', 'Outfit', sans-serif" }}
      >
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 gap-3">

            {/* LEFT: Logo + hamburger */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`md:hidden p-2 rounded-xl ${surfaceHov} transition-colors`}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>

              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-xl ${accentBg} flex items-center justify-center`}
                  style={{ boxShadow: "0 0 20px rgba(232,164,74,0.3)" }}
                >
                  <PenLine size={16} className="text-[#0f0f12]" />
                </div>
                <span className="font-bold text-lg tracking-tight hidden sm:block">
                  Nota<span className={accent}>.</span>
                </span>
              </div>
            </div>

            {/* MIDDLE: Search bar (desktop) */}
            <div className="hidden md:flex flex-1 max-w-sm mx-4">
              <button
                onClick={openSearch}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl border ${inputBg} ${surfaceHov} transition-all duration-200`}
              >
                <Search size={16} className={sub} />
                <span className={`text-sm flex-1 text-left ${sub}`}>Search notes…</span>
                <KbdHint keys={["⌘", "K"]} />
              </button>
            </div>

            {/* RIGHT: Controls */}
            <div className="flex items-center gap-1 sm:gap-2">

              {/* Search — mobile only */}
              <button
                onClick={openSearch}
                className={`md:hidden p-2 rounded-xl ${surfaceHov} transition-colors`}
                aria-label="Search"
              >
                <Search size={18} />
              </button>

              {/* View toggle */}
              <div className={`hidden sm:flex items-center p-1 rounded-xl ${surface} gap-0.5`}>
                {viewOptions.map(({ mode, Icon }) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    title={`${mode.charAt(0).toUpperCase() + mode.slice(1)} view`}
                    className={`p-1.5 rounded-lg transition-all duration-150 ${
                      viewMode === mode
                        ? `${accentBg} text-[#0f0f12] shadow-sm`
                        : `${sub} ${surfaceHov}`
                    }`}
                  >
                    <Icon size={16} />
                  </button>
                ))}
              </div>

              {/* 🌙 / ☀️  Theme toggle — calls global toggleTheme */}
              <button
                onClick={toggleTheme}
                title="Toggle theme"
                className={`p-2 rounded-xl ${surface} ${surfaceHov} transition-colors`}
                aria-label="Toggle theme"
              >
                {dark ? <Moon size={16} /> : <Sun size={16} />}
              </button>

              {/* Notifications */}
              <button
                title="Notifications"
                className={`relative p-2 rounded-xl ${surface} ${surfaceHov} transition-colors hidden sm:flex`}
                aria-label="Notifications"
              >
                <Bell size={18} />
                {notifCount > 0 && (
                  <span className={`absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold flex items-center justify-center ${accentBg} text-[#0f0f12]`}>
                    {notifCount}
                  </span>
                )}
              </button>

              {/* Pinned */}
              <button
                title="Pinned notes"
                className={`relative p-2 rounded-xl ${surface} ${surfaceHov} transition-colors hidden lg:flex`}
                aria-label="Pinned notes"
              >
                <Pin size={17} />
              </button>

              {/* New Note */}
              <button
                className={`hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl ${accentBg} text-[#0f0f12] text-sm font-semibold transition-all hover:opacity-90 active:scale-95`}
                style={{ boxShadow: "0 4px 16px rgba(232,164,74,0.25)" }}
              >
                <PenLine size={15} />
                <span className="hidden lg:block">New Note</span>
              </button>

              {/* Auth / Profile */}
              {loggedIn ? (
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 p-1 rounded-xl hover:opacity-90 transition-opacity"
                  >
                    <div className={`w-8 h-8 rounded-xl ${accentBg} flex items-center justify-center text-[#0f0f12] font-bold text-sm`}>
                      A
                    </div>
                    <span className={`hidden lg:block text-sm font-medium ${text}`}>Alex</span>
                  </button>

                  {profileOpen && (
                    <div className={`absolute right-0 top-full mt-2 w-52 rounded-2xl border ${dropdownBg} shadow-2xl py-2 z-50`}>
                      <div className={`px-4 py-3 border-b ${divider}`}>
                        <p className={`text-sm font-semibold ${text}`}>Alex Morgan</p>
                        <p className={`text-xs ${sub} mt-0.5`}>alex@nota.app</p>
                      </div>

                      {dropdownItems.map(({ label, Icon }) => (
                        <button
                          key={label}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm ${text} ${surfaceHov} transition-colors`}
                        >
                          <Icon size={15} className={sub} />
                          {label}
                        </button>
                      ))}

                      <div className={`my-1 border-t ${divider}`} />

                      <button
                        onClick={() => { setLoggedIn(false); setProfileOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 ${surfaceHov} transition-colors`}
                      >
                        <LogOut size={15} />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setLoggedIn(true)}
                    className={`hidden sm:block px-3.5 py-2 rounded-xl text-sm font-medium ${surface} ${surfaceHov} ${text} transition-colors border ${border}`}
                  >
                    Log in
                  </button>
                  <button
                    onClick={() => setLoggedIn(true)}
                    className={`px-3.5 py-2 rounded-xl ${accentBg} text-[#0f0f12] text-sm font-semibold transition-all hover:opacity-90 active:scale-95`}
                  >
                    Sign up
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className={`md:hidden border-t ${border} px-4 py-4 flex flex-col gap-3`}>
            <button
              onClick={() => { openSearch(); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border ${inputBg} transition-colors`}
            >
              <Search size={16} className={sub} />
              <span className={`text-sm ${sub}`}>Search notes…</span>
            </button>

            <div className="flex items-center gap-2">
              <span className={`text-xs ${sub}`}>View</span>
              <div className={`flex items-center p-1 rounded-xl ${surface} gap-0.5`}>
                {viewOptions.map(({ mode, Icon }) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`p-1.5 rounded-lg transition-all ${
                      viewMode === mode ? `${accentBg} text-[#0f0f12]` : `${sub} ${surfaceHov}`
                    }`}
                  >
                    <Icon size={16} />
                  </button>
                ))}
              </div>
            </div>

            <button className={`flex items-center gap-3 px-4 py-3 rounded-xl ${surface} ${surfaceHov} transition-colors`}>
              <Bell size={18} />
              <span className={`text-sm ${text}`}>Notifications</span>
              {notifCount > 0 && (
                <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${accentBg} text-[#0f0f12]`}>
                  {notifCount}
                </span>
              )}
            </button>

            <button className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl ${accentBg} text-[#0f0f12] text-sm font-semibold`}>
              <PenLine size={15} /> New Note
            </button>

            {!loggedIn && (
              <div className="flex gap-2">
                <button
                  onClick={() => setLoggedIn(true)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border ${border} ${surfaceHov} ${text} transition-colors`}
                >
                  Log in
                </button>
                <button
                  onClick={() => setLoggedIn(true)}
                  className={`flex-1 py-2.5 rounded-xl ${accentBg} text-[#0f0f12] text-sm font-semibold`}
                >
                  Sign up
                </button>
              </div>
            )}
          </div>
        )}
      </nav>
    </>
  );
}