import { useState, useEffect } from "react";
import { soutenanceApi } from "../api/api";
import { Calendar, Clock, MapPin, Users, BookOpen, LogOut, GraduationCap, AlertCircle } from "lucide-react";

const STATUS_CONFIG = {
  PLANIFIEE: { label: "Planifiée",  color: "#3b82f6", bg: "rgba(59,130,246,0.1)",  border: "rgba(59,130,246,0.3)"  },
  EN_COURS:  { label: "En cours",   color: "#7c3aed", bg: "rgba(124,58,237,0.1)",  border: "rgba(124,58,237,0.3)"  },
  TERMINEE:  { label: "Terminée",   color: "#10b981", bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.3)"  },
  ANNULEE:   { label: "Annulée",    color: "#ef4444", bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.3)"   },
};

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: 4,
      padding: "14px 16px", background: "rgba(255,255,255,0.03)",
      borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, color: "#475569", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        <Icon size={10} /> {label}
      </div>
      <div style={{ fontSize: 14, color: "#e2e8f0", fontWeight: 600 }}>{value || "—"}</div>
    </div>
  );
}

export default function EtudiantApp({ etudiant, onLogout }) {
  const [soutenance, setSoutenance] = useState(null);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    soutenanceApi.getByEtudiant(etudiant.id)
      .then(data => setSoutenance(data))
      .catch(() => setSoutenance(null))
      .finally(() => setLoading(false));
  }, [etudiant.id]);

  const cfg    = soutenance ? (STATUS_CONFIG[soutenance.statut] || STATUS_CONFIG.PLANIFIEE) : null;
  const jury   = soutenance?.creneau?.jury || [];
  const noteColor =
    soutenance?.note >= 16 ? "#10b981" :
    soutenance?.note >= 12 ? "#3b82f6" :
    soutenance?.note >= 10 ? "#f59e0b" : "#ef4444";

  return (
    <div style={{
      minHeight: "100vh", background: "#0f172a",
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "40px 24px",
    }}>
      {/* Dot grid */}
      <div style={{
        position: "fixed", inset: 0, opacity: 0.025, pointerEvents: "none",
        backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.8) 1px, transparent 0)",
        backgroundSize: "24px 24px",
      }} />
      {/* Glow */}
      <div style={{
        position: "fixed", top: 0, right: 0, width: 700, height: 500,
        pointerEvents: "none",
        background: "radial-gradient(ellipse at 80% 0%, rgba(59,130,246,0.12) 0%, rgba(124,58,237,0.06) 40%, transparent 70%)",
      }} />

      <div style={{ width: "100%", maxWidth: 680, position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 48, height: 48, borderRadius: "50%",
              background: "linear-gradient(135deg, #2563eb, #7c3aed)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, fontWeight: 800, color: "#fff",
              boxShadow: "0 4px 16px rgba(37,99,235,0.4)",
            }}>
              {etudiant.nom?.charAt(0) || "E"}
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#f1f5f9" }}>Ma soutenance</div>
              <div style={{ fontSize: 13, color: "#475569", marginTop: 2 }}>
                Bonjour, {etudiant.nom}
              </div>
            </div>
          </div>

          <button onClick={onLogout}
            style={{
              display: "flex", alignItems: "center", gap: 7, padding: "8px 14px",
              borderRadius: 8, border: "1px solid rgba(239,68,68,0.2)",
              background: "rgba(239,68,68,0.06)", color: "#f87171",
              fontSize: 12, fontWeight: 600, cursor: "pointer",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.12)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.06)"; }}>
            <LogOut size={13} /> Se déconnecter
          </button>
        </div>

        {/* Content */}
        {loading && (
          <div style={{ textAlign: "center", padding: 60, color: "#475569", fontSize: 14 }}>
            Chargement...
          </div>
        )}

        {!loading && !soutenance && (
          <div style={{
            textAlign: "center", padding: "60px 40px",
            background: "rgba(255,255,255,0.02)", borderRadius: 16,
            border: "1px dashed rgba(255,255,255,0.08)",
          }}>
            <AlertCircle size={40} color="#334155" style={{ margin: "0 auto 16px" }} />
            <div style={{ fontSize: 16, fontWeight: 700, color: "#64748b", marginBottom: 8 }}>
              Aucune soutenance planifiée
            </div>
            <div style={{ fontSize: 13, color: "#334155" }}>
              Votre soutenance n'a pas encore été programmée. Revenez consulter cette page ultérieurement.
            </div>
          </div>
        )}

        {!loading && soutenance && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Status + Subject card */}
            <div style={{
              background: "rgba(255,255,255,0.03)", borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.07)",
              padding: "22px 24px",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, color: "#475569", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
                    <BookOpen size={10} /> Sujet
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: "#f1f5f9" }}>
                    {soutenance.sujet?.titre || "—"}
                  </div>
                  {soutenance.sujet?.encadrant && (
                    <div style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>
                      Encadrant : {soutenance.sujet.encadrant}
                    </div>
                  )}
                </div>
                <span style={{
                  padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                  background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
                  display: "flex", alignItems: "center", gap: 5, flexShrink: 0, marginLeft: 12,
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.color, display: "inline-block" }} />
                  {cfg.label}
                </span>
              </div>
            </div>

            {/* Details grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <InfoRow icon={Calendar} label="Date"  value={soutenance.creneau?.date} />
              <InfoRow icon={Clock}    label="Heure" value={`${soutenance.creneau?.heureDebut || "—"} – ${soutenance.creneau?.heureFin || "—"}`} />
              <InfoRow icon={MapPin}   label="Salle" value={soutenance.creneau?.salle} />
              <InfoRow icon={Users}    label="Jury"  value={jury.length ? jury.map(j => j.nom).join(", ") : "—"} />
            </div>

            {/* Grade — only if TERMINEE */}
            {soutenance.statut === "TERMINEE" && soutenance.note !== null && (
              <div style={{
                background: `${noteColor}12`, border: `1px solid ${noteColor}40`,
                borderRadius: 16, padding: "24px",
                display: "flex", alignItems: "center", gap: 20,
              }}>
                <div style={{
                  width: 70, height: 70, borderRadius: 14, flexShrink: 0,
                  background: `${noteColor}20`, border: `2px solid ${noteColor}60`,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{ fontSize: 24, fontWeight: 800, color: noteColor, lineHeight: 1 }}>
                    {soutenance.note?.toFixed(1)}
                  </span>
                  <span style={{ fontSize: 10, color: noteColor, opacity: 0.7 }}>/20</span>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "#475569", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                    <GraduationCap size={11} style={{ verticalAlign: "middle", marginRight: 4 }} />
                    Résultat
                  </div>
                  {soutenance.mention && (
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9", marginBottom: 4 }}>
                      {soutenance.mention}
                    </div>
                  )}
                  {soutenance.observations && (
                    <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>
                      {soutenance.observations}
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        )}

        <div style={{ textAlign: "center", marginTop: 40, fontSize: 10, color: "#1e293b", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          Gestion PFA — 2025–2026
        </div>
      </div>
    </div>
  );
}
