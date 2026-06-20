import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Mail, Lock, Building, User, Phone,
  CheckCircle2, AlertCircle, ArrowRight, Eye, EyeOff,
  Truck, Shield, BarChart3, Package, Warehouse, 
  ClipboardList, UserCheck, Calculator, ShoppingCart, ChevronRight
} from "lucide-react";
import heroLogo from "../assets/hero.png";

// ─── Role Config ────────────────────────────────────────────────────────────
const ROLES = [
  { label: "Super Admin",       icon: Shield,        route: "/super-admin-dashboard",     color: "#a855f7", bg: "rgba(168,85,247,0.12)" },
  { label: "Sales",             icon: BarChart3,     route: "/sales-dashboard",            color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  { label: "Company Admin",     icon: Building,      route: "/company-admin-dashboard",    color: "#0ea5e9", bg: "rgba(14,165,233,0.12)" },
  { label: "Dispatcher",        icon: ClipboardList, route: "/dispatcher-dashboard",       color: "#10b981", bg: "rgba(16,185,129,0.12)" },
  { label: "Driver",            icon: Truck,         route: "/driver-dashboard",           color: "#f97316", bg: "rgba(249,115,22,0.12)" },
  { label: "Warehouse Manager", icon: Warehouse,     route: "/warehouse-dashboard",        color: "#06b6d4", bg: "rgba(6,182,212,0.12)" },
  { label: "Yard Attendant",    icon: Package,       route: "/yard-attendant-dashboard",   color: "#84cc16", bg: "rgba(132,204,22,0.12)" },
  { label: "Accounts",          icon: Calculator,    route: "/accounts-dashboard",         color: "#ec4899", bg: "rgba(236,72,153,0.12)" },
  { label: "Customer",          icon: ShoppingCart,  route: "/customer-dashboard",         color: "#8b5cf6", bg: "rgba(139,92,246,0.12)" },
];

const CREDS = { email: "admin@hero.com", password: "123456" };

// ─── Shared field component ──────────────────────────────────────────────────
function Field({ label, icon: Icon, type = "text", value, onChange, placeholder, action }) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>
        {action}
      </div>
      <div style={{ position: "relative" }}>
        <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#475569", display: "flex" }}>
          <Icon size={16} />
        </span>
        <input
          type={isPassword && show ? "text" : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required
          style={{
            width: "100%", boxSizing: "border-box",
            paddingLeft: 40, paddingRight: isPassword ? 40 : 14,
            paddingTop: 11, paddingBottom: 11,
            background: "rgba(15,23,42,0.6)",
            border: "1px solid rgba(51,65,85,0.8)",
            borderRadius: 10, color: "#f1f5f9", fontSize: 14,
            outline: "none", transition: "border-color 0.2s",
          }}
          onFocus={e => e.target.style.borderColor = "#0ea5e9"}
          onBlur={e => e.target.style.borderColor = "rgba(51,65,85,0.8)"}
        />
        {isPassword && (
          <button type="button" onClick={() => setShow(!show)}
            style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#475569", background: "none", border: "none", cursor: "pointer", display: "flex" }}>
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Left Branding Panel ─────────────────────────────────────────────────────
function BrandPanel() {
  return (
    <div className="hidden lg:flex" style={{
      width: "42%", minHeight: "100vh", position: "relative", overflow: "hidden",
      background: "linear-gradient(135deg, #0B0B0B 0%, #1F1F1F 50%, #0B0B0B 100%)",
      flexDirection: "column", justifyContent: "center", padding: "48px 44px",
      flexShrink: 0,
      borderRight: "1px solid #2E2E2E"
    }}>
      {/* Grid lines */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.05,
        backgroundImage: "linear-gradient(rgba(255,212,0,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,212,0,1) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }} />
      {/* Glow orbs */}
      <div style={{ position: "absolute", top: "15%", left: "10%", width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,212,0,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "15%", right: "-5%", width: 220, height: 220, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,154,0,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 52 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "#141414", border: "1px solid #2E2E2E", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 24px rgba(255,212,0,0.2)" }}>
            <img src={heroLogo} alt="Hero Logistics Logo" style={{ height: 26, width: "auto", objectFit: "contain" }} />
          </div>
          <div>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 18, color: "#f1f5f9", letterSpacing: "-0.02em" }}>Hero Logistics</div>
            <div style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.1em", textTransform: "uppercase" }}>Enterprise Suite</div>
          </div>
        </div>

        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 36, lineHeight: 1.15, color: "#f1f5f9", marginBottom: 16, letterSpacing: "-0.03em" }}>
          The Complete<br />
          <span style={{ background: "linear-gradient(90deg, #FFD400, #FF9A00)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Logistics OS</span>
        </h1>
        <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.7, marginBottom: 48, maxWidth: 320 }}>
          Manage fleets, dispatch loads, track drivers, run warehouses — all from one powerful platform built for modern logistics companies.
        </p>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 24, marginBottom: 48 }}>
          {[["9", "Dashboards"], ["24/7", "Live GPS"], ["100%", "Uptime SLA"]].map(([val, lbl]) => (
            <div key={lbl}>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 22, color: "#FFD400" }}>{val}</div>
              <div style={{ fontSize: 11, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em" }}>{lbl}</div>
            </div>
          ))}
        </div>

        {/* Feature pills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {["Real-time GPS", "AI Dispatch", "Driver App", "Warehouse WMS", "Payroll", "Customer Portal"].map(f => (
            <span key={f} style={{ padding: "5px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: "rgba(255,212,0,0.06)", border: "1px solid rgba(255,212,0,0.2)", color: "#FFD400" }}>
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom hint */}
      <div style={{ position: "absolute", bottom: 24, left: 44, right: 44, zIndex: 1 }}>
        <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(255,212,0,0.04)", border: "1px solid rgba(255,212,0,0.1)", fontSize: 12, color: "#64748b" }}>
          <span style={{ color: "#FFD400", fontWeight: 700 }}>Demo credentials:</span>  admin@hero.com &nbsp;/&nbsp; 123456
        </div>
      </div>
    </div>
  );
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────
export default function AuthPages({ view }) {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [credError, setCredError] = useState(false);

  const resetFeedback = () => { setError(""); setSuccess(""); setCredError(false); };

  // Validate creds before role click (now bypassed for instant access)
  const handleRoleClick = async (roleObj) => {
    resetFeedback();
    const loginEmail = email || CREDS.email;
    setEmail(loginEmail);
    setPassword(CREDS.password);
    setSubmitting(true);
    setSuccess(`Logging in as ${roleObj.label}…`);
    const result = await login(loginEmail, roleObj.label);
    if (result) {
      setSuccess(`Redirecting to ${roleObj.label} Dashboard…`);
      setTimeout(() => navigate(roleObj.route), 600);
    } else {
      setSubmitting(false);
      setError("Login failed. Please try again.");
      setSuccess("");
    }
  };

  const handleRegister = (e) => {
    e.preventDefault(); resetFeedback();
    if (!companyName || !fullName || !email || !phone || !password || !confirmPassword) { setError("All fields are required."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      login(email, "Company Admin");
      navigate("/onboarding");
    }, 1200);
  };

  const handleForgot = (e) => {
    e.preventDefault(); resetFeedback();
    if (!email) { setError("Please enter your registered email."); return; }
    setSubmitting(true);
    setTimeout(() => { setSubmitting(false); setSuccess("Reset link sent! Check your inbox."); }, 1000);
  };

  const handleReset = (e) => {
    e.preventDefault(); resetFeedback();
    if (!password || !confirmPassword) { setError("Fill in both password fields."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    setSubmitting(true);
    setTimeout(() => { setSubmitting(false); navigate("/login"); }, 1200);
  };

  // Shared wrapper styles
  const pageStyle = {
    minHeight: "100vh", display: "flex", background: "#0B0B0B",
    fontFamily: "'Outfit', 'Inter', sans-serif",
  };

  const rightStyle = {
    flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
    padding: "32px 40px", overflowY: "auto",
    background: "radial-gradient(ellipse at 60% 40%, rgba(255,212,0,0.03) 0%, transparent 60%)",
  };

  const cardStyle = {
    width: "100%", maxWidth: 480, margin: "0 auto"
  };

  const headingStyle = {
    fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 28,
    color: "#f1f5f9", letterSpacing: "-0.03em", marginBottom: 6,
  };

  const subStyle = { fontSize: 13, color: "#64748b", marginBottom: 28 };

  const btnPrimary = {
    width: "100%", padding: "12px 20px", borderRadius: 10, border: "none", cursor: "pointer",
    background: "linear-gradient(135deg, #FFD400, #FF9A00)", color: "#0B0B0B",
    fontWeight: 800, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
    boxShadow: "0 4px 20px rgba(255,212,0,0.25)", transition: "opacity 0.2s",
    opacity: submitting ? 0.6 : 1,
    fontFamily: "'Outfit', sans-serif",
  };

  const linkBtn = { background: "none", border: "none", cursor: "pointer", color: "#FF9A00", fontWeight: 700, fontSize: 13 };

  const divider = (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "18px 0" }}>
      <div style={{ flex: 1, height: 1, background: "rgba(51,65,85,0.5)" }} />
      <span style={{ fontSize: 11, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em" }}>Or sign in as</span>
      <div style={{ flex: 1, height: 1, background: "rgba(51,65,85,0.5)" }} />
    </div>
  );

  const alertBox = (msg, isError) => (
    <div style={{
      display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
      borderRadius: 10, marginBottom: 18, fontSize: 13,
      background: isError ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)",
      border: `1px solid ${isError ? "rgba(239,68,68,0.25)" : "rgba(16,185,129,0.25)"}`,
      color: isError ? "#fca5a5" : "#6ee7b7",
    }}>
      {isError ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
      {msg}
    </div>
  );

  // ── LOGIN VIEW ──────────────────────────────────────────────────────────────
  if (view === "login") {
    return (
      <div className="min-h-screen flex flex-col lg:flex-row bg-[#0B0B0B]" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>
        <BrandPanel />
        <div className="flex-1 flex items-center justify-center px-4 py-8 sm:px-10 overflow-y-auto" style={{
          background: "radial-gradient(ellipse at 60% 40%, rgba(255,212,0,0.03) 0%, transparent 60%)",
        }}>
          {success ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(16,185,129,0.1)", border: "2px solid rgba(16,185,129,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                <CheckCircle2 size={32} color="#10b981" />
              </div>
              <h2 style={{ ...headingStyle, textAlign: "center" }}>Authenticated!</h2>
              <p style={{ ...subStyle, textAlign: "center" }}>{success}</p>
              <div style={{ width: 40, height: 3, background: "linear-gradient(90deg, #FFD400, #FF9A00)", borderRadius: 4, margin: "0 auto", animation: "pulse 1s infinite" }} />
            </div>
          ) : (
            <div style={cardStyle}>
              <div style={{ marginBottom: 28 }}>
                <h2 style={headingStyle}>Welcome back</h2>
                <p style={subStyle}>Click any dashboard below for instant access, or sign in manually</p>
              </div>

              {error && alertBox(error, true)}

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <Field label="Email Address" icon={Mail} type="email" value={email}
                  onChange={e => { setEmail(e.target.value); resetFeedback(); }}
                  placeholder="admin@hero.com" />
                <Field label="Password" icon={Lock} type="password" value={password}
                  onChange={e => { setPassword(e.target.value); resetFeedback(); }}
                  placeholder="••••••••"
                  action={
                    <button style={{ ...linkBtn, fontSize: 11 }} onClick={() => navigate("/forgot-password")}>
                      Forgot password?
                    </button>
                  } />
              </div>

              {divider}

              {/* 9 Role Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ROLES.map(r => {
                  const Icon = r.icon;
                  return (
                    <button
                      key={r.label}
                      onClick={() => handleRoleClick(r)}
                      style={{
                        padding: "12px 8px", borderRadius: 10, cursor: "pointer",
                        background: r.bg, border: `1px solid ${r.color}30`,
                        display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                        transition: "all 0.2s", fontFamily: "'Outfit', sans-serif",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.border = `1px solid ${r.color}80`; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 24px ${r.color}20`; }}
                      onMouseLeave={e => { e.currentTarget.style.border = `1px solid ${r.color}30`; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                    >
                      <span style={{ width: 32, height: 32, borderRadius: 8, background: `${r.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon size={15} color={r.color} />
                      </span>
                      <span style={{ fontSize: 10, fontWeight: 600, color: "#cbd5e1", textAlign: "center", lineHeight: 1.3 }}>
                        {r.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div style={{ textAlign: "center", marginTop: 24, fontSize: 13, color: "#475569" }}>
                New to platform?{" "}
                <button style={linkBtn} onClick={() => navigate("/register")}>Start Free Trial</button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── REGISTER VIEW ───────────────────────────────────────────────────────────
  if (view === "register") {
    return (
      <div className="min-h-screen flex flex-col lg:flex-row bg-[#0B0B0B]" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>
        <BrandPanel />
        <div className="flex-1 flex items-center justify-center px-4 py-8 sm:px-10 overflow-y-auto" style={{
          background: "radial-gradient(ellipse at 60% 40%, rgba(255,212,0,0.03) 0%, transparent 60%)",
        }}>
          <div style={cardStyle}>
            <div style={{ marginBottom: 24 }}>
              <h2 style={headingStyle}>Start Free Trial</h2>
              <p style={subStyle}>14-day full access · No credit card required</p>
            </div>

            {error && alertBox(error, true)}
            {success && alertBox(success, false)}

            <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 13 }}>
              <Field label="Company Name" icon={Building} value={companyName}
                onChange={e => setCompanyName(e.target.value)} placeholder="Apex Logistics LLC" />
              <Field label="Full Name" icon={User} value={fullName}
                onChange={e => setFullName(e.target.value)} placeholder="John Smith" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Business Email" icon={Mail} type="email" value={email}
                  onChange={e => setEmail(e.target.value)} placeholder="you@company.com" />
                <Field label="Phone" icon={Phone} type="tel" value={phone}
                  onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Password" icon={Lock} type="password" value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
                <Field label="Confirm" icon={Lock} type="password" value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" />
              </div>

              <label style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 12, color: "#64748b", cursor: "pointer" }}>
                <input type="checkbox" required style={{ marginTop: 2, accentColor: "#FF9A00" }} />
                <span>I agree to the <button type="button" style={{ ...linkBtn, fontSize: 12 }}>Terms of Service</button> and <button type="button" style={{ ...linkBtn, fontSize: 12 }}>Privacy Policy</button></span>
              </label>

              <button type="submit" style={btnPrimary} disabled={submitting}>
                {submitting ? "Creating workspace…" : "Create Account & Start Trial"} <ArrowRight size={15} />
              </button>
            </form>

            <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "#475569" }}>
              Already registered?{" "}
              <button style={linkBtn} onClick={() => navigate("/login")}>Login Portal</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── FORGOT PASSWORD VIEW ────────────────────────────────────────────────────
  if (view === "forgot-password") {
    return (
      <div className="min-h-screen flex flex-col lg:flex-row bg-[#0B0B0B]" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>
        <BrandPanel />
        <div className="flex-1 flex items-center justify-center px-4 py-8 sm:px-10 overflow-y-auto" style={{
          background: "radial-gradient(ellipse at 60% 40%, rgba(255,212,0,0.03) 0%, transparent 60%)",
        }}>
          <div style={cardStyle}>
            <div style={{ marginBottom: 28 }}>
              <h2 style={headingStyle}>Forgot Password?</h2>
              <p style={subStyle}>Enter your email to receive a secure reset link</p>
            </div>

            {error && alertBox(error, true)}
            {success && alertBox(success, false)}

            <form onSubmit={handleForgot} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Field label="Email Address" icon={Mail} type="email" value={email}
                onChange={e => setEmail(e.target.value)} placeholder="name@company.com" />
              <button type="submit" style={btnPrimary} disabled={submitting}>
                {submitting ? "Sending…" : "Send Reset Link"} <ArrowRight size={15} />
              </button>
            </form>

            <div style={{ textAlign: "center", marginTop: 24 }}>
              <button style={linkBtn} onClick={() => navigate("/login")}>← Back to Login</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── RESET PASSWORD VIEW ─────────────────────────────────────────────────────
  if (view === "reset-password") {
    return (
      <div className="min-h-screen flex flex-col lg:flex-row bg-[#0B0B0B]" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>
        <BrandPanel />
        <div className="flex-1 flex items-center justify-center px-4 py-8 sm:px-10 overflow-y-auto" style={{
          background: "radial-gradient(ellipse at 60% 40%, rgba(255,212,0,0.03) 0%, transparent 60%)",
        }}>
          <div style={cardStyle}>
            <div style={{ marginBottom: 28 }}>
              <h2 style={headingStyle}>Reset Password</h2>
              <p style={subStyle}>Create a new secure password for your account</p>
            </div>

            {error && alertBox(error, true)}
            {success && alertBox(success, false)}

            <form onSubmit={handleReset} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Field label="New Password" icon={Lock} type="password" value={password}
                onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
              <Field label="Confirm New Password" icon={Lock} type="password" value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" />
              <button type="submit" style={btnPrimary} disabled={submitting}>
                {submitting ? "Updating…" : "Update Password"} <ArrowRight size={15} />
              </button>
            </form>

            <div style={{ textAlign: "center", marginTop: 24 }}>
              <button style={linkBtn} onClick={() => navigate("/login")}>← Back to Login</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
