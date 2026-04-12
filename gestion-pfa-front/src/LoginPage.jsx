import { useState } from "react";
import { authApi } from "./api/api";
import { GraduationCap, Mail, Lock, LogIn } from "lucide-react";

export default function LoginPage({ onLogin }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError("Email et mot de passe requis."); return; }
    setLoading(true); setError(null);
    try {
      const user = await authApi.login(email, password);
      onLogin(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%", padding: "11px 12px 11px 38px",
    borderRadius: 10, border: "1px solid rgba(15,23,42,0.12)",
    background: "#f8fafc", color: "#0f172a",
    fontSize: 14, outline: "none",
    transition: "border-color 0.15s, box-shadow 0.15s",
    boxSizing: "border-box",
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#f5f7fb",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      padding: 20,
    }}>
      {/* Background decoration */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        background: "radial-gradient(ellipse at 30% 20%, rgba(37,99,235,0.06) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(124,58,237,0.04) 0%, transparent 60%)",
        pointerEvents: "none",
      }} />

      <div style={{
        width: "100%", maxWidth: 400,
        background: "#fff", borderRadius: 20,
        border: "1px solid rgba(15,23,42,0.08)",
        boxShadow: "0 20px 60px rgba(15,23,42,0.08)",
        overflow: "hidden",
        animation: "fadeUp 0.4s cubic-bezier(0.16,1,0.3,1)",
      }}>
        <style>{`
          @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        `}</style>

        {/* Header */}
        <div style={{
          padding: "32px 32px 24px",
          background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)",
          textAlign: "center",
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: "linear-gradient(135deg, #2563eb, #7c3aed)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 14px",
            boxShadow: "0 8px 20px rgba(37,99,235,0.4)",
          }}>
            <GraduationCap size={24} color="#fff" />
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.4px" }}>
            Gestion PFA
          </div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
            Soutenances 2025–2026
          </div>
        </div>

        {/* Form */}
        <div style={{ padding: "28px 32px 32px" }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>
            Connexion
          </div>
          <div style={{ fontSize: 13, color: "#64748b", marginBottom: 24 }}>
            Entrez vos identifiants pour accéder à votre espace
          </div>

          {error && (
            <div style={{
              background: "#fee2e2", border: "1px solid #ef4444",
              color: "#991b1b", borderRadius: 8, padding: "10px 14px",
              fontSize: 13, fontWeight: 500, marginBottom: 16,
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Email */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>
                Email
              </label>
              <div style={{ position: "relative" }}>
                <Mail size={14} color="#94a3b8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                <input
                  type="email"
                  placeholder="votre@email.tn"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = "#3b82f6"; e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.12)"; e.target.style.background = "#fff"; }}
                  onBlur={e => { e.target.style.borderColor = "rgba(15,23,42,0.12)"; e.target.style.boxShadow = "none"; e.target.style.background = "#f8fafc"; }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>
                Mot de passe
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={14} color="#94a3b8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = "#3b82f6"; e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.12)"; e.target.style.background = "#fff"; }}
                  onBlur={e => { e.target.style.borderColor = "rgba(15,23,42,0.12)"; e.target.style.boxShadow = "none"; e.target.style.background = "#f8fafc"; }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 6, padding: "12px",
                background: loading ? "#93c5fd" : "#2563eb",
                color: "#fff", border: "none", borderRadius: 10,
                fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: loading ? "none" : "0 4px 14px rgba(37,99,235,0.35)",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = "#1d4ed8"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
              onMouseLeave={e => { e.currentTarget.style.background = loading ? "#93c5fd" : "#2563eb"; e.currentTarget.style.transform = "none"; }}
            >
              <LogIn size={15} />
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          {/* Test accounts */}
          <div style={{
            marginTop: 20, padding: "12px 14px",
            background: "#f8fafc", borderRadius: 8,
            border: "1px solid rgba(15,23,42,0.06)",
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
              Comptes de test
            </div>
            {[
              { role: "Admin", email: "admin@pfa.tn",  mdp: "admin123" },
              { role: "Prof",  email: "jaidi@pfa.tn",  mdp: "prof123"  },
            ].map(acc => (
              <div key={acc.role}
                onClick={() => { setEmail(acc.email); setPassword(acc.mdp); }}
                style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "5px 0", cursor: "pointer",
                  borderBottom: acc.role === "Admin" ? "1px solid rgba(15,23,42,0.06)" : "none",
                }}>
                <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>{acc.role}</span>
                <span style={{ fontSize: 11, color: "#94a3b8", fontFamily: "'JetBrains Mono', monospace" }}>
                  {acc.email}
                </span>
              </div>
            ))}
            <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 6 }}>
              Cliquez pour pré-remplir
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}