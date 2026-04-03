import { useState, useEffect, useCallback } from "react";
import { affectationApi } from "../api/api";
import StatsBar from "./StatsBar";
import { Badge, STATUS_AFFECTATION } from "./Badges";

export default function ValidationAffectations() {
  const [affectations, setAffectations] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [filter, setFilter]             = useState("EN_ATTENTE");
  const [commentaires, setCommentaires] = useState({});
  const [openRefus, setOpenRefus]       = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await affectationApi.getAll();
      setAffectations(data);
      setError(null);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleValider = async (id) => {
    setActionLoading(id + "-valider");
    try { await affectationApi.valider(id); await load(); }
    catch (e) { setError(e.message); }
    finally { setActionLoading(null); }
  };

  const handleRefuser = async (id) => {
    const c = commentaires[id]?.trim();
    if (!c) { setError("Un commentaire est requis pour refuser."); return; }
    setActionLoading(id + "-refuser");
    try { await affectationApi.refuser(id, c); setOpenRefus(null); await load(); }
    catch (e) { setError(e.message); }
    finally { setActionLoading(null); }
  };

  const handleValiderToutes = async () => {
    setActionLoading("all");
    try { await affectationApi.validerToutes(); await load(); }
    catch (e) { setError(e.message); }
    finally { setActionLoading(null); }
  };

  const count = (s) => affectations.filter(a => a.statut === s).length;
  const filtered = filter === "TOUT" ? affectations : affectations.filter(a => a.statut === filter);

  const FILTERS = [
    { key: "EN_ATTENTE", label: "En attente", bg: "#fef3c7", border: "#f59e0b", text: "#92400e" },
    { key: "VALIDEE",    label: "Validée",    bg: "#d1fae5", border: "#10b981", text: "#065f46" },
    { key: "REFUSEE",    label: "Refusée",    bg: "#fee2e2", border: "#ef4444", text: "#991b1b" },
    { key: "TOUT",       label: "Toutes",     bg: "#dbeafe", border: "#3b82f6", text: "#1e40af" },
  ];

  if (loading) return <LoadingState />;

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        .aff-card { transition: box-shadow 0.15s; }
        .aff-card:hover { box-shadow: 0 2px 16px rgba(0,0,0,0.08); }
        .btn-act { transition: opacity 0.15s, transform 0.1s; cursor: pointer; }
        .btn-act:hover { opacity: 0.85; }
        .btn-act:active { transform: scale(0.97); }
      `}</style>

      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
          Phase 1
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: "var(--text)", letterSpacing: "-0.4px" }}>
          Validation des affectations
        </h1>
      </div>

      <StatsBar stats={[
        { label: "En attente", value: count("EN_ATTENTE"), total: affectations.length, color: "#f59e0b" },
        { label: "Validées",   value: count("VALIDEE"),    total: affectations.length, color: "#10b981" },
        { label: "Refusées",   value: count("REFUSEE"),    total: affectations.length, color: "#ef4444" },
        { label: "Total",      value: affectations.length, color: "#3b82f6" },
      ]} />

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        {FILTERS.map(f => {
          const isActive = filter === f.key;
          return (
            <button key={f.key} className="btn-act"
              onClick={() => setFilter(f.key)}
              style={{
                padding: "6px 14px", borderRadius: 20, fontSize: 13,
                border: `1px solid ${isActive ? f.border : "var(--border2)"}`,
                background: isActive ? f.bg : "var(--surface)",
                color: isActive ? f.text : "var(--muted)",
                fontWeight: isActive ? 600 : 400,
              }}>
              {f.label}
              {f.key !== "TOUT" && <span style={{ marginLeft: 6, fontSize: 11 }}>{count(f.key)}</span>}
            </button>
          );
        })}
        {count("EN_ATTENTE") > 0 && (
          <button className="btn-act"
            onClick={handleValiderToutes}
            disabled={actionLoading === "all"}
            style={{
              marginLeft: "auto", padding: "6px 18px", borderRadius: 20,
              border: "none", background: "#10b981", color: "#fff",
              fontSize: 13, fontWeight: 600, opacity: actionLoading === "all" ? 0.6 : 1,
            }}>
            {actionLoading === "all" ? "En cours..." : `Valider toutes (${count("EN_ATTENTE")})`}
          </button>
        )}
      </div>

      {error && (
        <div style={{
          background: "#fee2e2", border: "1px solid #ef4444", color: "#991b1b",
          borderRadius: "var(--radius)", padding: "10px 14px", fontSize: 13,
          marginBottom: 16, fontWeight: 500,
        }}>
          {error}
          <button onClick={() => setError(null)} style={{ float: "right", background: "none", border: "none", color: "#991b1b", cursor: "pointer", fontWeight: 700 }}>x</button>
        </div>
      )}

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--muted)" }}>
          Aucune affectation dans cette catégorie.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map(a => {
          const cfg = STATUS_AFFECTATION[a.statut];
          return (
            <div key={a.id} className="aff-card"
              style={{
                background: "var(--surface)",
                border: `1px solid ${cfg?.border || "var(--border2)"}`,
                borderLeft: `4px solid ${cfg?.border || "var(--border2)"}`,
                borderRadius: "var(--radius-lg)", padding: "20px 24px",
              }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", marginBottom: 3 }}>
                    {a.binome?.etudiant1?.nom} & {a.binome?.etudiant2?.nom}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--muted)", fontFamily: "'DM Mono', monospace" }}>
                    Moy. {a.binome?.moyenneBinome?.toFixed(2)} / 20 — Score {a.score?.toFixed(1)} pts
                  </div>
                </div>
                <Badge config={cfg} />
              </div>

              <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr",
                gap: "8px 32px", borderTop: "1px solid var(--border)",
                paddingTop: 14, marginBottom: 16,
              }}>
                {[
                  ["Sujet",       a.sujet?.titre],
                  ["Encadrant",   a.sujet?.encadrant?.nom],
                  ["Département", a.sujet?.encadrant?.departement],
                  ["Difficulté",  a.sujet?.difficulte ? `Niveau ${a.sujet.difficulte}` : "—"],
                ].map(([label, val]) => (
                  <div key={label}>
                    <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>
                      {label}
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text)" }}>{val || "—"}</div>
                  </div>
                ))}
              </div>

              {a.commentaireAdmin && (
                <div style={{
                  background: "#fef3c7", border: "1px solid #f59e0b",
                  borderRadius: 8, padding: "8px 12px",
                  fontSize: 12, color: "#92400e", marginBottom: 12,
                }}>
                  {a.commentaireAdmin}
                </div>
              )}

              {!a.verrouillee ? (
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <button className="btn-act"
                    onClick={() => handleValider(a.id)}
                    disabled={actionLoading === a.id + "-valider"}
                    style={{
                      padding: "7px 18px", borderRadius: 8,
                      border: "none", background: "#10b981", color: "#fff",
                      fontSize: 13, fontWeight: 600,
                      opacity: actionLoading === a.id + "-valider" ? 0.6 : 1,
                    }}>
                    {actionLoading === a.id + "-valider" ? "..." : "Valider"}
                  </button>
                  <button className="btn-act"
                    onClick={() => setOpenRefus(openRefus === a.id ? null : a.id)}
                    style={{
                      padding: "7px 18px", borderRadius: 8,
                      border: "1px solid #ef4444", background: "#fee2e2",
                      color: "#991b1b", fontSize: 13, fontWeight: 600,
                    }}>
                    Refuser
                  </button>
                  {openRefus === a.id && (
                    <div style={{ display: "flex", gap: 8, width: "100%", marginTop: 4 }}>
                      <input autoFocus
                        placeholder="Raison du refus..."
                        value={commentaires[a.id] || ""}
                        onChange={e => setCommentaires(p => ({ ...p, [a.id]: e.target.value }))}
                        style={{
                          flex: 1, padding: "7px 12px", borderRadius: 8,
                          border: "1px solid #ef4444", background: "#fff",
                          color: "var(--text)", outline: "none", fontSize: 13,
                        }}
                      />
                      <button className="btn-act"
                        onClick={() => handleRefuser(a.id)}
                        disabled={actionLoading === a.id + "-refuser"}
                        style={{
                          padding: "7px 16px", borderRadius: 8,
                          border: "none", background: "#ef4444", color: "#fff",
                          fontSize: 13, fontWeight: 600,
                        }}>
                        {actionLoading === a.id + "-refuser" ? "..." : "Confirmer"}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{
                  fontSize: 12, color: "#065f46", background: "#d1fae5",
                  border: "1px solid #10b981", borderRadius: 8,
                  padding: "6px 12px", display: "inline-block", fontWeight: 500,
                }}>
                  Affectation verrouillée
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {[1,2,3].map(i => (
        <div key={i} style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)", height: 120, opacity: 1 - i * 0.2,
        }} />
      ))}
    </div>
  );
}