"use client";

import { useState } from "react";
import axios, { AxiosError } from "axios";
import { useTheme, ModalProvider } from "../context/ThemeContext";
import 
import {
    X,
    User,
    Mail,
    Lock,
    Eye,
    EyeOff,
    LogOut,
    Loader2,
    CheckCircle2,
    AlertCircle,
    PenLine,
    ShieldCheck,
} from "lucide-react";

const BASE_URL = "http://localhost:8000";

const api = axios.create({
    baseURL: BASE_URL,
    headers: { "Content-Type": "application/json" },
});

interface RegisterPayload {
    name: string;
    email: string;
    password: string;
}

interface RegisterResponse {
    message: string;
    user?: {
        user_id: string;
        name: string;
        email: string;
        created_at: string;
    };
    token?: string;
}

interface FieldError {
    name?: string;
    email?: string;
    password?: string;
    confirm?: string;
}

interface RegisterModalProps {
    onClose: () => void;
    onSwitchToLogin?: () => void;
}

function InputField({
    label,
    type,
    value,
    onChange,
    placeholder,
    icon: Icon,
    error,
    dark,
    rightElement,
}: {
    label: string;
    type: string;
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
    icon: React.ElementType;
    error?: string;
    dark: boolean;
    rightElement?: React.ReactNode;
}) {
    const border = error
        ? "border-red-500/60 focus-within:border-red-500"
        : dark
            ? "border-white/[0.08] focus-within:border-[#e8a44a]/60"
            : "border-black/[0.1] focus-within:border-[#e8a44a]/80";
    const bg = dark ? "bg-[#1e1c22]" : "bg-[#f8f7f5]";
    const text = dark ? "text-[#e8e6e0]" : "text-[#1a1916]";
    const sub = dark ? "text-[#6b6862]" : "text-[#9a9690]";
    const labelColor = dark ? "text-[#b0aca6]" : "text-[#5a5652]";

    return (
        <div className="flex flex-col gap-1.5">
            <label className={`text-xs font-semibold uppercase tracking-wider ${labelColor}`}>
                {label}
            </label>
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${bg} ${border} transition-colors duration-150`}>
                <Icon size={16} className={error ? "text-red-400" : sub} />
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className={`flex-1 bg-transparent outline-none text-sm ${text} placeholder-[#5a5652]`}
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
    const getStrength = () => {
        if (!password) return { score: 0, label: "", color: "" };
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
        return { score, ...levels[score - 1] || levels[0] };
    };

    const { score, label, color } = getStrength();
    if (!password) return null;

    return (
        <div className="flex items-center gap-2 mt-1">
            <div className="flex gap-1 flex-1">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= score ? color : dark ? "bg-white/[0.08]" : "bg-black/[0.08]"
                            }`}
                    />
                ))}
            </div>
            <span className={`text-[10px] font-medium ${score === 1 ? "text-red-400" :
                    score === 2 ? "text-amber-400" :
                        score === 3 ? "text-yellow-400" :
                            "text-green-400"
                }`}>
                {label}
            </span>
        </div>
    );
}

export default function RegisterModal({ onClose, onSwitchToLogin }: RegisterModalProps) {
    const { dark } = useTheme();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [showConf, setShowConf] = useState(false);
    const [errors, setErrors] = useState<FieldError>({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [apiError, setApiError] = useState("");
    const [logoutLoading, setLogoutLoading] = useState(false);

    const validate = (): boolean => {
        const newErrors: FieldError = {};
        if (!name.trim()) newErrors.name = "Name is required";
        else if (name.trim().length < 2) newErrors.name = "Name must be at least 2 characters";
        if (!email.trim()) newErrors.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
            newErrors.email = "Enter a valid email address";
        if (!password) newErrors.password = "Password is required";
        else if (password.length < 8) newErrors.password = "Password must be at least 8 characters";
        if (!confirm) newErrors.confirm = "Please confirm your password";
        else if (confirm !== password) newErrors.confirm = "Passwords do not match";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // ── Register API call ──
    const handleRegister = async () => {
        setApiError("");
        if (!validate()) return;

        setLoading(true);
        try {
            const payload: RegisterPayload = {
                name: name.trim(),
                email: email.trim().toLowerCase(),
                password,
            };

            const res = await api.post<RegisterResponse>("/api/auth/register", payload);

            // Store token if returned
            if (res.data.token) {
                localStorage.setItem("token", res.data.token);
            }
            if (res.data.user) {
                localStorage.setItem("user", JSON.stringify(res.data.user));
            }

            setSuccess(true);
            setTimeout(() => {
                onClose();
                onSwitchToLogin?.();
            }, 2000);
        } catch (err) {
            const error = err as AxiosError<{ message?: string; error?: string }>;
            const msg =
                error.response?.data?.message ||
                error.response?.data?.error ||
                "Registration failed. Please try again.";
            setApiError(msg);
        } finally {
            setLoading(false);
        }
    };

    // ── Logout ──
    const handleLogout = async () => {
        setLogoutLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (token) {
                await api.post("/api/auth/logout", {}, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }
        } catch {
            // Logout even if API fails
        } finally {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setLogoutLoading(false);
            onClose();
        }
    };

    // ── Theme tokens ──
    const modalBg = dark ? "bg-[#17161a]" : "bg-white";
    const border = dark ? "border-white/[0.08]" : "border-black/[0.08]";
    const text = dark ? "text-[#e8e6e0]" : "text-[#1a1916]";
    const sub = dark ? "text-[#6b6862]" : "text-[#9a9690]";
    const surface = dark ? "bg-white/[0.05]" : "bg-black/[0.04]";
    const surfaceHov = dark ? "hover:bg-white/[0.08]" : "hover:bg-black/[0.06]";
    const divider = dark ? "border-white/[0.06]" : "border-black/[0.06]";
    const accentBg = "bg-[#e8a44a]";

    // ── Success state ──
    if (success) {
        return (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                style={{ background: dark ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.4)", backdropFilter: "blur(12px)" }}
            >
                <div className={`w-full max-w-md rounded-3xl border ${modalBg} ${border} shadow-2xl p-10 flex flex-col items-center gap-4 text-center`}>
                    <div className="w-16 h-16 rounded-2xl bg-green-500/15 flex items-center justify-center">
                        <CheckCircle2 size={36} className="text-green-400" />
                    </div>
                    <div>
                        <h3 className={`text-xl font-bold ${text}`}>Account Created!</h3>
                        <p className={`text-sm mt-1 ${sub}`}>Welcome to Nota, {name.trim()}. Redirecting you to login…</p>
                    </div>
                    <div className="w-8 h-1 rounded-full bg-green-500/30 overflow-hidden">
                        <div className="h-full bg-green-400 animate-[shrink_2s_linear]" style={{ animation: "progress 2s linear forwards" }} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: dark ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.4)", backdropFilter: "blur(12px)" }}
            onClick={onClose}
        >
            <div
                className={`w-full max-w-md rounded-3xl border ${modalBg} ${border} shadow-2xl flex flex-col overflow-hidden`}
                style={{
                    maxHeight: "95vh",
                    boxShadow: dark
                        ? "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)"
                        : "0 32px 80px rgba(0,0,0,0.12)",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* ── Header ── */}
                <div className={`flex items-center justify-between px-6 py-5 border-b ${divider}`}>
                    <div className="flex items-center gap-3">
                        <div
                            className={`w-9 h-9 rounded-xl ${accentBg} flex items-center justify-center`}
                            style={{ boxShadow: "0 0 20px rgba(232,164,74,0.3)" }}
                        >
                            <PenLine size={17} className="text-[#0f0f12]" />
                        </div>
                        <div>
                            <h2 className={`font-bold text-base leading-none ${text}`}>Create Account</h2>
                            <p className={`text-[11px] mt-0.5 ${sub}`}>Join Nota and start writing</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                        {/* Logout button */}
                        <button
                            onClick={handleLogout}
                            disabled={logoutLoading}
                            title="Logout"
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border ${border} ${surface} ${surfaceHov} text-red-400 transition-all`}
                        >
                            {logoutLoading
                                ? <Loader2 size={13} className="animate-spin" />
                                : <LogOut size={13} />
                            }
                            <span className="hidden sm:inline">Logout</span>
                        </button>

                        {/* Close */}
                        <button
                            onClick={onClose}
                            className={`p-2 rounded-xl ${surfaceHov} ${sub} transition-colors`}
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>

                {/* ── Form ── */}
                <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">

                    {/* API error banner */}
                    {apiError && (
                        <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
                            <AlertCircle size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-red-400 leading-relaxed">{apiError}</p>
                        </div>
                    )}

                    {/* Name */}
                    <InputField
                        label="Full Name"
                        type="text"
                        value={name}
                        onChange={(v) => { setName(v); setErrors((e) => ({ ...e, name: undefined })); }}
                        placeholder="Alex Morgan"
                        icon={User}
                        error={errors.name}
                        dark={dark}
                    />

                    {/* Email */}
                    <InputField
                        label="Email Address"
                        type="email"
                        value={email}
                        onChange={(v) => { setEmail(v); setErrors((e) => ({ ...e, email: undefined })); }}
                        placeholder="alex@example.com"
                        icon={Mail}
                        error={errors.email}
                        dark={dark}
                    />

                    {/* Password */}
                    <div className="flex flex-col gap-1.5">
                        <InputField
                            label="Password"
                            type={showPass ? "text" : "password"}
                            value={password}
                            onChange={(v) => { setPassword(v); setErrors((e) => ({ ...e, password: undefined })); }}
                            placeholder="Min. 8 characters"
                            icon={Lock}
                            error={errors.password}
                            dark={dark}
                            rightElement={
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    className={`${sub} hover:text-[#e8a44a] transition-colors`}
                                >
                                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            }
                        />
                        <PasswordStrength password={password} dark={dark} />
                    </div>

                    {/* Confirm password */}
                    <InputField
                        label="Confirm Password"
                        type={showConf ? "text" : "password"}
                        value={confirm}
                        onChange={(v) => { setConfirm(v); setErrors((e) => ({ ...e, confirm: undefined })); }}
                        placeholder="Re-enter your password"
                        icon={ShieldCheck}
                        error={errors.confirm}
                        dark={dark}
                        rightElement={
                            <button
                                type="button"
                                onClick={() => setShowConf(!showConf)}
                                className={`${sub} hover:text-[#e8a44a] transition-colors`}
                            >
                                {showConf ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        }
                    />

                    {/* Terms note */}
                    <p className={`text-[11px] leading-relaxed ${sub} text-center px-2`}>
                        By creating an account, you agree to our{" "}
                        <span className="text-[#e8a44a] cursor-pointer hover:underline">Terms of Service</span>{" "}
                        and{" "}
                        <span className="text-[#e8a44a] cursor-pointer hover:underline">Privacy Policy</span>.
                    </p>
                </div>

                {/* ── Footer ── */}
                <div className={`px-6 py-5 border-t ${divider} flex flex-col gap-3`}>
                    {/* Register button */}
                    <button
                        onClick={handleRegister}
                        disabled={loading}
                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all
              ${loading
                                ? `${surface} ${sub} cursor-not-allowed border ${border}`
                                : `${accentBg} text-[#0f0f12] hover:opacity-90 active:scale-[0.98]`
                            }`}
                        style={!loading ? { boxShadow: "0 4px 20px rgba(232,164,74,0.3)" } : {}}
                    >
                        {loading
                            ? <><Loader2 size={16} className="animate-spin" /> Creating account…</>
                            : <><User size={15} /> Create Account</>
                        }
                    </button>

                    {/* Switch to login */}
                    {onSwitchToLogin && (
                        <p className={`text-center text-xs ${sub}`}>
                            Already have an account?{" "}
                            <button
                                onClick={onSwitchToLogin}
                                className="text-[#e8a44a] font-semibold hover:underline transition-all"
                            >
                                Log in
                            </button>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}