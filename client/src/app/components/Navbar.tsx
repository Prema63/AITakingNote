"use client";

import { useState, useEffect, useRef } from "react";
import axios, { AxiosError } from "axios";
import { useTheme } from "../context/ThemeContext";
import {
  Search, Moon, Sun, PenLine, Bell, LayoutGrid, List,
  X, Menu, User, LogOut, Settings, Tag, Pin, Trash2, Clock,
  Lock, Mail, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle,
  ShieldCheck, LucideIcon,
} from "lucide-react";
import AddNoteModal, { NewNote } from "./AddNotes";

const api = axios.create({
  baseURL: "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
});

interface KbdHintProps { keys: string[] }
interface ViewOption { mode: "grid" | "list"; Icon: LucideIcon }
interface RecentSearch { label: string; Icon: LucideIcon }
interface DropdownItem { label: string; Icon: LucideIcon }
interface FieldError { name?: string; email?: string; password?: string; confirm?: string }

interface AuthUser {
  user_id: string;
  name: string;
  email: string;
  created_at: string;
}

const KbdHint = ({ keys }: KbdHintProps) => (
  <span className="hidden sm:flex items-center gap-1 text-[10px] font-mono opacity-40">
    {keys.map((k, i) => (
      <kbd key={i} className="px-1 py-0.5 rounded border border-current bg-transparent">{k}</kbd>
    ))}
  </span>
);

function InputField({
  label, type, value, onChange, icon: Icon,
  error, dark, rightElement,
}: {
  label: string; type: string; value: string;
  onChange: (v: string) => void;
  icon: React.ElementType; error?: string; dark: boolean;
  rightElement?: React.ReactNode;
}) {
  const borderCls = error
    ? "border-red-500/60 focus-within:border-red-500"
    : dark ? "border-white/[0.08] focus-within:border-[#e8a44a]/60"
      : "border-black/[0.1] focus-within:border-[#e8a44a]/80";
  const bg = dark ? "bg-[#1e1c22]" : "bg-[#f8f7f5]";
  const txt = dark ? "text-[#e8e6e0]" : "text-[#1a1916]";
  const sub = dark ? "text-[#6b6862]" : "text-[#9a9690]";
  const lbl = dark ? "text-[#b0aca6]" : "text-[#5a5652]";

  return (
    <div className="flex flex-col gap-1.5">
      <label className={`text-xs font-semibold uppercase tracking-wider ${lbl}`}>{label}</label>
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${bg} ${borderCls} transition-colors duration-150`}>
        <Icon size={16} className={error ? "text-red-400" : sub} />
        <input
          type={type} value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`flex-1 bg-transparent outline-none text-sm ${txt} `}
        />
        {rightElement}
      </div>
      {error && (
        <div className="flex items-center gap-1.5">
          <AlertCircle size={11} className="text-red-400 flex-shrink-0" />
          <span className="text-[11px] text-red-400">{error}</span>
        </div>
      )}
    </div>
  );
}

function PasswordStrength({ password, dark }: { password: string; dark: boolean }) {
  if (!password) return null;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const levels = [
    { label: "Weak", color: "bg-red-500" },
    { label: "Fair", color: "bg-amber-500" },
    { label: "Good", color: "bg-yellow-400" },
    { label: "Strong", color: "bg-green-500" },
  ];
  const { label, color } = levels[score - 1] ?? levels[0];
  const labelColor = ["text-red-400", "text-amber-400", "text-yellow-400", "text-green-400"][score - 1] ?? "text-red-400";

  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex gap-1 flex-1">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= score ? color : dark ? "bg-white/[0.08]" : "bg-black/[0.08]"}`} />
        ))}
      </div>
      <span className={`text-[10px] font-medium ${labelColor}`}>{label}</span>
    </div>
  );
}

// MODAL BACKDROP
function ModalBackdrop({ dark, onClose, children }: { dark: boolean; onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: dark ? "rgba(0,0,0,0.82)" : "rgba(0,0,0,0.4)", backdropFilter: "blur(12px)" }}
      onClick={onClose}
    >
      {children}
    </div>
  );
}

// REGISTER MODAL

function RegisterModal({
  dark, onClose, onSuccess, onSwitchToLogin,
}: {
  dark: boolean;
  onClose: () => void;
  onSuccess: (user: AuthUser) => void;
  onSwitchToLogin: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [errors, setErrors] = useState<FieldError>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [apiError, setApiError] = useState("");

  const validate = () => {
    const e: FieldError = {};
    if (!name.trim()) e.name = "Name is required";
    else if (name.trim().length < 2) e.name = "At least 2 characters";
    if (!email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    else if (password.length < 8) e.password = "Min. 8 characters";
    if (!confirm) e.confirm = "Please confirm password";
    else if (confirm !== password) e.confirm = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    setApiError("");
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await api.post<{ message: string; user?: AuthUser; token?: string }>(
        "/api/auth/register",
        { name: name.trim(), email: email.trim().toLowerCase(), password }
      );
      if (res.data.token) localStorage.setItem("token", res.data.token);
      if (res.data.user) localStorage.setItem("user", JSON.stringify(res.data.user));
      setDone(true);
      setTimeout(() => { onSuccess(res.data.user!); onClose(); }, 1800);
    } catch (err) {
      const e = err as AxiosError<{ message?: string; error?: string }>;
      setApiError(e.response?.data?.message ?? e.response?.data?.error ?? "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const modalBg = dark ? "bg-[#17161a]" : "bg-white";
  const bdr = dark ? "border-white/[0.08]" : "border-black/[0.08]";
  const txt = dark ? "text-[#e8e6e0]" : "text-[#1a1916]";
  const sub = dark ? "text-[#6b6862]" : "text-[#9a9690]";
  const srf = dark ? "bg-white/[0.05]" : "bg-black/[0.04]";
  const sHov = dark ? "hover:bg-white/[0.08]" : "hover:bg-black/[0.06]";
  const div = dark ? "border-white/[0.06]" : "border-black/[0.06]";

  if (done) return (
    <ModalBackdrop dark={dark} onClose={onClose}>
      <div className={`w-full max-w-md rounded-3xl border ${modalBg} ${bdr} p-10 flex flex-col items-center gap-4 text-center`}>
        <div className="w-16 h-16 rounded-2xl bg-green-500/15 flex items-center justify-center">
          <CheckCircle2 size={36} className="text-green-400" />
        </div>
        <h3 className={`text-xl font-bold ${txt}`}>Account Created!</h3>
        <p className={`text-sm ${sub}`}>Welcome, {name.trim()}. Signing you in…</p>
      </div>
    </ModalBackdrop>
  );

  return (
    <ModalBackdrop dark={dark} onClose={onClose}>
      <div
        className={`w-full max-w-md rounded-3xl border ${modalBg} ${bdr} shadow-2xl flex flex-col overflow-hidden`}
        style={{ maxHeight: "95vh", boxShadow: dark ? "0 32px 80px rgba(0,0,0,0.6),0 0 0 1px rgba(255,255,255,0.04)" : "0 32px 80px rgba(0,0,0,0.12)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`flex items-center justify-between px-6 py-5 border-b ${div}`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#e8a44a] flex items-center justify-center" style={{ boxShadow: "0 0 20px rgba(232,164,74,0.3)" }}>
              <PenLine size={17} className="text-[#0f0f12]" />
            </div>
            <div>
              <h2 className={`font-bold text-base leading-none ${txt}`}>Create Account</h2>
              <p className={`text-[11px] mt-0.5 ${sub}`}>Join Notes and start writing</p>
            </div>
          </div>
          <button onClick={onClose} className={`p-2 rounded-xl ${sHov} ${sub} transition-colors`}><X size={16} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
          {apiError && (
            <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <AlertCircle size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-400 leading-relaxed">{apiError}</p>
            </div>
          )}
          <InputField label="Full Name" type="text" value={name} onChange={(v) => { setName(v); setErrors(e => ({ ...e, name: undefined })); }} icon={User} error={errors.name} dark={dark} />
          <InputField label="Email Address" type="email" value={email} onChange={(v) => { setEmail(v); setErrors(e => ({ ...e, email: undefined })); }} icon={Mail} error={errors.email} dark={dark} />
          <div className="flex flex-col gap-1.5">
            <InputField label="Password" type={showPass ? "text" : "password"} value={password} onChange={(v) => { setPassword(v); setErrors(e => ({ ...e, password: undefined })); }} icon={Lock} error={errors.password} dark={dark}
              rightElement={<button type="button" onClick={() => setShowPass(!showPass)} className={`${sub} hover:text-[#e8a44a] transition-colors`}>{showPass ? <EyeOff size={15} /> : <Eye size={15} />}</button>}
            />
            <PasswordStrength password={password} dark={dark} />
          </div>
          <InputField label="Confirm Password" type={showConf ? "text" : "password"} value={confirm} onChange={(v) => { setConfirm(v); setErrors(e => ({ ...e, confirm: undefined })); }} icon={ShieldCheck} error={errors.confirm} dark={dark}
            rightElement={<button type="button" onClick={() => setShowConf(!showConf)} className={`${sub} hover:text-[#e8a44a] transition-colors`}>{showConf ? <EyeOff size={15} /> : <Eye size={15} />}</button>}
          />

        </div>

        <div className={`px-6 py-5 border-t ${div} flex flex-col gap-3`}>
          <button onClick={handleRegister} disabled={loading}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all ${loading ? `${srf} ${sub} cursor-not-allowed border ${bdr}` : "bg-[#e8a44a] text-[#0f0f12] hover:opacity-90 active:scale-[0.98]"}`}
            style={!loading ? { boxShadow: "0 4px 20px rgba(232,164,74,0.3)" } : {}}
          >
            {loading ? <><Loader2 size={16} className="animate-spin" />Creating account…</> : <><User size={15} />Create Account</>}
          </button>
          <p className={`text-center text-xs ${sub}`}>
            Already have an account?{" "}
            <button onClick={onSwitchToLogin} className="text-[#e8a44a] font-semibold hover:underline">Log in</button>
          </p>
        </div>
      </div>
    </ModalBackdrop>
  );
}

// LOGIN MODAL
function LoginModal({
  dark, onClose, onSuccess, onSwitchToRegister,
}: {
  dark: boolean;
  onClose: () => void;
  onSuccess: (user: AuthUser) => void;
  onSwitchToRegister: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState<FieldError>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const validate = () => {
    const e: FieldError = {};
    if (!email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    setApiError("");
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await api.post<{ message: string; user?: AuthUser; token?: string }>(
        "/api/auth/login",
        { email: email.trim().toLowerCase(), password }
      );
      if (res.data.token) localStorage.setItem("token", res.data.token);
      if (res.data.user) localStorage.setItem("user", JSON.stringify(res.data.user));
      onSuccess(res.data.user!);
      onClose();
    } catch (err) {
      const e = err as AxiosError<{ message?: string; error?: string }>;
      setApiError(e.response?.data?.message ?? e.response?.data?.error ?? "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const modalBg = dark ? "bg-[#17161a]" : "bg-white";
  const bdr = dark ? "border-white/[0.08]" : "border-black/[0.08]";
  const txt = dark ? "text-[#e8e6e0]" : "text-[#1a1916]";
  const sub = dark ? "text-[#6b6862]" : "text-[#9a9690]";
  const srf = dark ? "bg-white/[0.05]" : "bg-black/[0.04]";
  const sHov = dark ? "hover:bg-white/[0.08]" : "hover:bg-black/[0.06]";
  const div = dark ? "border-white/[0.06]" : "border-black/[0.06]";

  return (
    <ModalBackdrop dark={dark} onClose={onClose}>
      <div
        className={`w-full max-w-md rounded-3xl border ${modalBg} ${bdr} shadow-2xl flex flex-col overflow-hidden`}
        style={{ boxShadow: dark ? "0 32px 80px rgba(0,0,0,0.6),0 0 0 1px rgba(255,255,255,0.04)" : "0 32px 80px rgba(0,0,0,0.12)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`flex items-center justify-between px-6 py-5 border-b ${div}`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#e8a44a] flex items-center justify-center" style={{ boxShadow: "0 0 20px rgba(232,164,74,0.3)" }}>
              <PenLine size={17} className="text-[#0f0f12]" />
            </div>
            <div>
              <h2 className={`font-bold text-base leading-none ${txt}`}>Welcome back</h2>
              <p className={`text-[11px] mt-0.5 ${sub}`}>Sign in to your Notes account</p>
            </div>
          </div>
          <button onClick={onClose} className={`p-2 rounded-xl ${sHov} ${sub} transition-colors`}><X size={16} /></button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          {apiError && (
            <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <AlertCircle size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-400 leading-relaxed">{apiError}</p>
            </div>
          )}
          <InputField label="Email Address" type="email" value={email} onChange={(v) => { setEmail(v); setErrors(e => ({ ...e, email: undefined })); }} icon={Mail} error={errors.email} dark={dark} />
          <InputField label="Password" type={showPass ? "text" : "password"} value={password} onChange={(v) => { setPassword(v); setErrors(e => ({ ...e, password: undefined })); }} icon={Lock} error={errors.password} dark={dark}
            rightElement={<button type="button" onClick={() => setShowPass(!showPass)} className={`${sub} hover:text-[#e8a44a] transition-colors`}>{showPass ? <EyeOff size={15} /> : <Eye size={15} />}</button>}
          />
          <div className="flex justify-end">
            <button className="text-[11px] text-[#e8a44a] hover:underline">Forgot password?</button>
          </div>
        </div>

        <div className={`px-6 pb-6 flex flex-col gap-3`}>
          <button onClick={handleLogin} disabled={loading}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all ${loading ? `${srf} ${sub} cursor-not-allowed border ${bdr}` : "bg-[#e8a44a] text-[#0f0f12] hover:opacity-90 active:scale-[0.98]"}`}
            style={!loading ? { boxShadow: "0 4px 20px rgba(232,164,74,0.3)" } : {}}
          >
            {loading ? <><Loader2 size={16} className="animate-spin" />Signing in…</> : <>Sign In</>}
          </button>
          <p className={`text-center text-xs ${sub}`}>
            Don&apos;t have an account?{" "}
            <button onClick={onSwitchToRegister} className="text-[#e8a44a] font-semibold hover:underline">Sign up</button>
          </p>
        </div>
      </div>
    </ModalBackdrop>
  );
}

// NAVBAR
export default function Navbar() {
  const { dark, toggleTheme } = useTheme();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifCount] = useState(3);

  const [modal, setModal] = useState<null | "login" | "register">(null);
  const [addNoteOpen, setAddNoteOpen] = useState(false);

  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    if (typeof window === "undefined") return null;
    try { return JSON.parse(localStorage.getItem("user") ?? "null"); } catch { return null; }
  });

  const loggedIn = !!authUser;

  const searchRef = useRef<HTMLInputElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

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
        setModal(null);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) await api.post("/api/auth/logout", {}, { headers: { Authorization: `Bearer ${token}` } });
    } catch { /* ignore */ } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setAuthUser(null);
      setProfileOpen(false);
    }
  };

  const handleAuthSuccess = (user: AuthUser) => setAuthUser(user);

  const handleNoteSaved = (note: NewNote) => {
    // Optional: lift this up to a parent notes list if needed
    console.log("Note saved successfully:", note);
  };

  // theme tokens
  const bg = dark ? "bg-[#0f0f12]" : "bg-[#faf9f7]";
  const border = dark ? "border-white/[0.07]" : "border-black/[0.07]";
  const text = dark ? "text-[#e8e6e0]" : "text-[#1a1916]";
  const sub = dark ? "text-[#6b6862]" : "text-[#9a9690]";
  const surface = dark ? "bg-white/[0.05]" : "bg-black/[0.04]";
  const surfaceHov = dark ? "hover:bg-white/[0.08]" : "hover:bg-black/[0.07]";
  const accentBg = "bg-[#e8a44a]";
  const inputBg = dark ? "bg-[#1a1916] border-white/[0.08]" : "bg-white border-black/[0.1]";
  const dropdownBg = dark ? "bg-[#17161a] border-white/[0.08]" : "bg-white border-black/[0.1]";
  const divider = dark ? "border-white/[0.06]" : "border-black/[0.06]";

  const openSearch = () => { setSearchOpen(true); setTimeout(() => searchRef.current?.focus(), 50); };

  const viewOptions: ViewOption[] = [{ mode: "grid", Icon: LayoutGrid }, { mode: "list", Icon: List }];
  const recentSearches: RecentSearch[] = [
    { label: "Meeting notes — Q2", Icon: Clock },
    { label: "Design system tokens", Icon: Tag },
    { label: "Book recommendations", Icon: Pin },
  ];
  const dropdownItems: DropdownItem[] = [
    { label: "Profile", Icon: User },
    { label: "Settings", Icon: Settings },
    { label: "Tags", Icon: Tag },
    { label: "Trash", Icon: Trash2 },
  ];

  const initials = authUser?.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() ?? "U";

  return (
    <>
      {/* ── Auth Modals ── */}
      {modal === "register" && (
        <RegisterModal
          dark={dark}
          onClose={() => setModal(null)}
          onSuccess={handleAuthSuccess}
          onSwitchToLogin={() => setModal("login")}
        />
      )}
      {modal === "login" && (
        <LoginModal
          dark={dark}
          onClose={() => setModal(null)}
          onSuccess={handleAuthSuccess}
          onSwitchToRegister={() => setModal("register")}
        />
      )}

      {/* ── Add Note Modal ── */}
      {addNoteOpen && (
        <AddNoteModal
          userId={authUser?.user_id}
          onClose={() => setAddNoteOpen(false)}
          onSave={handleNoteSaved}
        />
      )}

      {/* ── Search Overlay ── */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4"
          style={{ background: dark ? "rgba(0,0,0,0.75)" : "rgba(0,0,0,0.35)", backdropFilter: "blur(8px)" }}
          onClick={() => setSearchOpen(false)}
        >
          <div
            className={`w-full max-w-xl rounded-2xl border ${dark ? "bg-[#17161a] border-white/[0.1]" : "bg-white border-black/[0.1]"} shadow-2xl overflow-hidden`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`flex items-center gap-3 px-5 py-4 border-b ${divider}`}>
              <Search size={18} className={sub} />
              <input ref={searchRef} autoFocus value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}

                className={`flex-1 bg-transparent outline-none text-base ${text} `}
              />
              {searchQuery && <button onClick={() => setSearchQuery("")} className={`${sub} transition-colors`}><X size={18} /></button>}
              <kbd className={`hidden sm:block text-[10px] font-mono px-1.5 py-0.5 rounded border ${dark ? "border-white/20 text-white/30" : "border-black/20 text-black/30"}`}>Esc</kbd>
            </div>
            <div className="p-3">
              {searchQuery === "" ? (
                <>
                  <p className={`text-[11px] uppercase tracking-widest font-semibold px-3 mb-2 ${sub}`}>Recent searches</p>
                  {recentSearches.map(({ label, Icon }, i) => (
                    <button key={i} className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl ${surfaceHov} transition-colors`}>
                      <Icon size={15} className={sub} />
                      <span className={`text-sm ${text}`}>{label}</span>
                    </button>
                  ))}
                </>
              ) : (
                <>
                  <p className={`text-[11px] uppercase tracking-widest font-semibold px-3 mb-2 ${sub}`}>Results for &ldquo;{searchQuery}&rdquo;</p>
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

            {/* LEFT */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className={`md:hidden p-2 rounded-xl ${surfaceHov} transition-colors`} aria-label="Toggle menu">
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl ${accentBg} flex items-center justify-center`} style={{ boxShadow: "0 0 20px rgba(232,164,74,0.3)" }}>
                  <PenLine size={16} className="text-[#0f0f12]" />
                </div>
                <span className="font-bold text-lg tracking-tight hidden sm:block">Notes</span>
              </div>
            </div>

            {/* MIDDLE: search (desktop) */}
            <div className="hidden md:flex flex-1 max-w-sm mx-4">
              <button onClick={openSearch} className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl border ${inputBg} ${surfaceHov} transition-all duration-200`}>
                <Search size={16} className={sub} />
                <span className={`text-sm flex-1 text-left ${sub}`}>Search notes…</span>
                <KbdHint keys={["⌘", "K"]} />
              </button>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-1 sm:gap-2">

              {/* mobile search */}
              <button onClick={openSearch} className={`md:hidden p-2 rounded-xl ${surfaceHov} transition-colors`} aria-label="Search">
                <Search size={18} />
              </button>



              {/* theme toggle */}
              <button onClick={toggleTheme} title="Toggle theme" className={`p-2 rounded-xl ${surface} ${surfaceHov} transition-colors`} aria-label="Toggle theme">
                {dark ? <Moon size={16} /> : <Sun size={16} />}
              </button>

              {/* ── New Note button (desktop) ── */}
              <button
                onClick={() => setAddNoteOpen(true)}
                className={`hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl ${accentBg} text-[#0f0f12] text-sm font-semibold transition-all hover:opacity-90 active:scale-95`}
                style={{ boxShadow: "0 4px 16px rgba(232,164,74,0.25)" }}
              >
                <PenLine size={15} />
                <span className="hidden lg:block">New Note</span>
              </button>

              {/* Auth / Profile */}
              {loggedIn ? (
                <div className="relative" ref={profileRef}>
                  <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 p-1 rounded-xl hover:opacity-90 transition-opacity">
                    <div className={`w-8 h-8 rounded-xl ${accentBg} flex items-center justify-center text-[#0f0f12] font-bold text-sm`}>{initials}</div>
                    <span className={`hidden lg:block text-sm font-medium ${text}`}>{authUser?.name?.split(" ")[0]}</span>
                  </button>

                  {profileOpen && (
                    <div className={`absolute right-0 top-full mt-2 w-52 rounded-2xl border ${dropdownBg} shadow-2xl py-2 z-50`}>
                      <div className={`px-4 py-3 border-b ${divider}`}>
                        <p className={`text-sm font-semibold ${text}`}>{authUser?.name}</p>
                        <p className={`text-xs ${sub} mt-0.5`}>{authUser?.email}</p>
                      </div>
                      {dropdownItems.map(({ label, Icon }) => (
                        <button key={label} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm ${text} ${surfaceHov} transition-colors`}>
                          <Icon size={15} className={sub} />{label}
                        </button>
                      ))}
                      <div className={`my-1 border-t ${divider}`} />
                      <button onClick={handleLogout} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 ${surfaceHov} transition-colors`}>
                        <LogOut size={15} />Sign out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setModal("login")}
                    className={`hidden sm:block px-3.5 py-2 rounded-xl text-sm font-medium ${surface} ${surfaceHov} ${text} transition-colors border ${border}`}
                  >
                    Log in
                  </button>
                  <button
                    onClick={() => setModal("register")}
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
            <button onClick={() => { openSearch(); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border ${inputBg} transition-colors`}>
              <Search size={16} className={sub} />
              <span className={`text-sm ${sub}`}>Search notes…</span>
            </button>
            <div className="flex items-center gap-2">
              <span className={`text-xs ${sub}`}>View</span>
              <div className={`flex items-center p-1 rounded-xl ${surface} gap-0.5`}>
                {viewOptions.map(({ mode, Icon }) => (
                  <button key={mode} onClick={() => setViewMode(mode)} className={`p-1.5 rounded-lg transition-all ${viewMode === mode ? `${accentBg} text-[#0f0f12]` : `${sub} ${surfaceHov}`}`}>
                    <Icon size={16} />
                  </button>
                ))}
              </div>
            </div>
            <button className={`flex items-center gap-3 px-4 py-3 rounded-xl ${surface} ${surfaceHov} transition-colors`}>
              <Bell size={18} />
              <span className={`text-sm ${text}`}>Notifications</span>
              {notifCount > 0 && <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${accentBg} text-[#0f0f12]`}>{notifCount}</span>}
            </button>

            {/* ── New Note button (mobile) ── */}
            <button
              onClick={() => { setAddNoteOpen(true); setMobileMenuOpen(false); }}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl ${accentBg} text-[#0f0f12] text-sm font-semibold`}
            >
              <PenLine size={15} /> New Note
            </button>

            {!loggedIn && (
              <div className="flex gap-2">
                <button onClick={() => { setModal("login"); setMobileMenuOpen(false); }} className={`flex-1 py-2.5 rounded-xl text-sm font-medium border ${border} ${surfaceHov} ${text} transition-colors`}>Log in</button>
                <button onClick={() => { setModal("register"); setMobileMenuOpen(false); }} className={`flex-1 py-2.5 rounded-xl ${accentBg} text-[#0f0f12] text-sm font-semibold`}>Sign up</button>
              </div>
            )}
          </div>
        )}
      </nav>
    </>
  );
}