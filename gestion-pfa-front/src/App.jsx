import { useState, useEffect } from "react";
import { Calendar, Layout, ClipboardList, MessageCircle, ChevronRight, LogOut } from "lucide-react";
import { NotificationCenter } from "./components/NotificationPopup";
import LoginPage      from "./LoginPage";
import ProfApp        from "./components/ProfApp";
import Disponibilites from "./components/Disponibilites";
import Planification  from "./components/Planification";
import PlanningFinal  from "./components/PlanningFinal";
import Chat           from "./components/Chat";
import DemandesSujets from "./components/DemandesSujets";

const STORAGE_KEY = "pfa_user";

const NAV = [
  { id: "phase2",   label: "Créneaux",        sub: "Salles & disponibilités", icon: Calendar      },
  { id: "phase3",   label: "Planification",   sub: "Drag & drop binômes",    icon: Layout        },
  { id: "phase4",   label: "Planning final",  sub: "Résultats & notes",      icon: ClipboardList },
  { id: "chat",     label: "Messagerie",      sub: "Chat avec les profs",    icon: MessageCircle },
  { id: "demandes", label: "Demandes sujets", sub: "Requêtes étudiants",     icon: ClipboardList },
];

function NavItem({ item, active, onSelect }) {
  const isActive = active === item.id;
  const Icon     = item.icon;
  return (
    <button onClick={() => onSelect(item.id)}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        width: "100%", padding: "9px 10px", borderRadius: 10,
        border: "none", textAlign: "left", cursor: "pointer",
        background: isActive ? "rgba(59,130,246,0.16)" : "transparent",
        marginBottom: 2, transition: "all 0.15s", position: "relative",
      }}
      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
    >
      {isActive && (
        <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 3, height: 18, background: "#3b82f6", borderRadius: "0 3px 3px 0" }} />
      )}
      <div style={{
        width: 30, height: 30, borderRadius: 8, flexShrink: 0,
        background: isActive ? "rgba(59,130,246,0.25)" : "rgba(255,255,255,0.04)",
        border: `1px solid ${isActive ? "rgba(59,130,246,0.4)" : "rgba(255,255,255,0.06)"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon size={13} color={isActive ? "#60a5fa" : "#475569"} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: isActive ? 600 : 400, color: isActive ? "#e2e8f0" : "#64748b" }}>
          {item.label}
        </div>
        <div style={{ fontSize: 10, color: "#334155" }}>{item.sub}</div>
      </div>
      {isActive && <ChevronRight size={11} color="#3b82f6" />}
    </button>
  );
}

function AdminSidebar({ user, active, onSelect, onLogout }) {
  return (
    <aside style={{
      width: 240, flexShrink: 0, background: "#0f172a",
      display: "flex", flexDirection: "column",
      height: "100vh", position: "sticky", top: 0, overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", inset: 0, opacity: 0.025,
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.8) 1px, transparent 0)`,
        backgroundSize: "24px 24px", pointerEvents: "none",
      }} />

      {/* User info + Bell — same as prof */}
      <div style={{ padding: "20px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
            background: "linear-gradient(135deg, #2563eb, #7c3aed)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 700, color: "#fff",
            boxShadow: "0 4px 12px rgba(37,99,235,0.35)",
          }}>
            {user?.nom?.charAt(0) || "A"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.nom || "Admin"}
            </div>
            <div style={{ fontSize: 10, color: "#475569" }}>Chef de département</div>
          </div>
        </div>
        <NotificationCenter onNavigate={onSelect} />
      </div>

      <nav style={{ padding: "14px 10px", flex: 1, overflow: "auto" }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: "0.1em", padding: "4px 8px", marginBottom: 6 }}>
          Gestion
        </div>
        {NAV.slice(0, 3).map(item => <NavItem key={item.id} item={item} active={active} onSelect={onSelect} />)}

        <div style={{ fontSize: 9, fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: "0.1em", padding: "4px 8px", marginTop: 16, marginBottom: 6 }}>
          Communication
        </div>
        <NavItem item={NAV[3]} active={active} onSelect={onSelect} />

        <div style={{ fontSize: 9, fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: "0.1em", padding: "4px 8px", marginTop: 16, marginBottom: 6 }}>
          Étudiants
        </div>
        <NavItem item={NAV[4]} active={active} onSelect={onSelect} />
      </nav>

      {/* Logout — same style as prof */}
      <div style={{ padding: "12px 10px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <button onClick={onLogout}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            width: "100%", padding: "8px 10px", borderRadius: 8,
            border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.06)",
            cursor: "pointer", color: "#f87171", fontSize: 12, fontWeight: 600,
            transition: "all 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.12)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.06)"; }}
        >
          <LogOut size={13} /> Se déconnecter
        </button>
      </div>
    </aside>
  );
}

// App name top right banner
function AppBanner() {
  return (
    <div style={{
      position: "fixed", top: 0, right: 0,
      padding: "8px 20px", zIndex: 100,
      display: "flex", alignItems: "center", gap: 8,
    }}>
      <span style={{ fontSize: 11, color: "var(--text-4)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
        Gestion PFA
      </span>
      <span style={{ fontSize: 10, color: "var(--text-4)", opacity: 0.5 }}>2025–2026</span>
    </div>
  );
}

export default function App() {
  const [user, setUser]     = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); }
    catch { return null; }
  });
  const [active, setActive] = useState("phase2");

  const handleLogin  = (u) => { localStorage.setItem(STORAGE_KEY, JSON.stringify(u)); setUser(u); };
  const handleLogout = ()  => { localStorage.removeItem(STORAGE_KEY); setUser(null); };

  if (!user) return <LoginPage onLogin={handleLogin} />;
  if (user.role === "PROFESSEUR") return <ProfApp prof={user} onLogout={handleLogout} />;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <AdminSidebar user={user} active={active} onSelect={setActive} onLogout={handleLogout} />
      <main style={{ flex: 1, overflow: "auto", padding: "40px 48px" }}>
        <AppBanner />
        <div style={{
          position: "fixed", top: 0, right: 0, width: 700, height: 500,
          pointerEvents: "none", zIndex: 0,
          background: "radial-gradient(ellipse at 80% 0%, rgba(59,130,246,0.04) 0%, transparent 65%)",
        }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto" }}>
          {active === "phase2"   && <Disponibilites />}
          {active === "phase3"   && <Planification />}
          {active === "phase4"   && <PlanningFinal />}
          {active === "chat"     && <Chat />}
          {active === "demandes" && <DemandesSujets />}
        </div>
      </main>
    </div>
  );
}