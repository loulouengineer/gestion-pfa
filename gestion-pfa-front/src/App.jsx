import { useState } from "react";
import ValidationAffectations from "./components/ValidationAffectations";
import Disponibilites from "./components/Disponibilites";
import PlanningFinal from "./components/PlanningFinal";
import Planification from "./components/Planification";

const NAV = [
  { id: "phase1", label: "Validation",      sub: "Affectations en attente" },
  { id: "phase2", label: "Disponibilités",  sub: "Créneaux & profs" },
  { id: "phase3", label: "Planification",   sub: "Assignation jury" },
  { id: "phase4", label: "Planning final",  sub: "Résultats & présence" },
];

function Sidebar({ active, onSelect }) {
  return (
    <aside style={{
      width: 220, flexShrink: 0,
      background: "#141720",
      borderRight: "1px solid rgba(255,255,255,0.07)",
      display: "flex", flexDirection: "column",
      height: "100vh", position: "sticky", top: 0,
    }}>
      <div style={{
        padding: "24px 20px 20px",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#e8eaf0", letterSpacing: "-0.2px" }}>
          Gestion PFA
        </div>
        <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>
          Soutenances 2025–2026
        </div>
      </div>

      <nav style={{ padding: "12px 10px", flex: 1 }}>
        <div style={{
          fontSize: 10, color: "#4b5563", textTransform: "uppercase",
          letterSpacing: "0.08em", padding: "4px 10px", marginBottom: 4,
        }}>
          Phases
        </div>
        {NAV.map((item, i) => {
          const isActive = active === item.id;
          return (
            <button key={item.id}
              onClick={() => onSelect(item.id)}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                width: "100%", padding: "9px 10px", borderRadius: 8,
                border: "none", textAlign: "left", cursor: "pointer",
                background: isActive ? "rgba(59,130,246,0.15)" : "transparent",
                marginBottom: 2, transition: "background 0.15s",
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
            >
              <div style={{
                width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                background: isActive ? "#3b82f6" : "rgba(255,255,255,0.06)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 600,
                color: isActive ? "#fff" : "#6b7280",
                transition: "all 0.15s",
              }}>
                {i + 1}
              </div>
              <div>
                <div style={{
                  fontSize: 13,
                  fontWeight: isActive ? 500 : 400,
                  color: isActive ? "#e8eaf0" : "#9ca3af",
                }}>
                  {item.label}
                </div>
                <div style={{ fontSize: 11, color: "#4b5563", marginTop: 1 }}>
                  {item.sub}
                </div>
              </div>
            </button>
          );
        })}
      </nav>

      <div style={{
        padding: "16px 20px",
        borderTop: "1px solid rgba(255,255,255,0.07)",
      }}>
        <div style={{ fontSize: 11, color: "#4b5563" }}>
          Backend · localhost:8081
        </div>
      </div>
    </aside>
  );
}

function Placeholder({ phase, title, description, endpoints }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", height: "60vh", gap: 16, textAlign: "center",
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: "var(--surface)", border: "1px solid var(--border2)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 18, fontWeight: 600, color: "var(--muted)",
      }}>
        {phase}
      </div>
      <div>
        <div style={{ fontSize: 18, fontWeight: 500, color: "var(--text)", marginBottom: 8 }}>
          {title}
        </div>
        <div style={{ fontSize: 14, color: "var(--muted)", maxWidth: 360 }}>
          {description}
        </div>
      </div>
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border2)",
        borderRadius: 8, padding: "12px 20px", maxWidth: 420,
      }}>
        {endpoints.map(ep => (
          <div key={ep} style={{
            fontSize: 12, fontFamily: "'DM Mono', monospace",
            color: "var(--muted2)", marginBottom: 4,
          }}>
            {ep}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [active, setActive] = useState("phase1");

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar active={active} onSelect={setActive} />
      <main style={{ flex: 1, overflow: "auto", padding: "40px 48px", background: "var(--bg)" }}>
        {active === "phase1" && <ValidationAffectations />}
        {active === "phase2" && <Disponibilites />}
        {active === "phase3" && <Planification />}
        {active === "phase4" && <PlanningFinal />}
      </main>
    </div>
  );
}