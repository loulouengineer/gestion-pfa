import { useState, useEffect, useCallback } from "react";
import { soutenanceApi } from "../api/api";
import StatsBar from "./StatsBar";
import { Badge, STATUS_SOUTENANCE } from "./Badges";

function Field({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>
        {label}
      </div>
      <div style={{ fontSize: 13, color: "var(--text)" }}>{value || "—"}</div>
    </div>
  );
}

export default function PlanningFinal() {
  const [soutenances, setSoutenances]     = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [search, setSearch]               = useState("");
  const [dateFilter, setDateFilter]       = useState("");
  const [expandedId, setExpandedId]       = useState(null);
  const [resultatForm, setResultatForm]   = useState({});
  const [actionLoading, setActionLoading] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = dateFilter
        ? await soutenanceApi.getPlanningParDate(dateFilter)
        : await soutenanceApi.getPlanningFinal();
      setSoutenances(data);
      setError(null);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [dateFilter]);

  useEffect(() => { load(); }, [load]);

  const handleResultat = async (id) => {
    const r = resultatForm[id];
    if (!r?.note) { setError("La note est obligatoire."); return; }
    setActionLoading(id);
    try {
      await soutenanceApi.enregistrerResultat(id, {
        note: parseFloat(r.note),
        observations: r.observations || "",
        present: r.present !== false,
      });
      setExpandedId(null);
      await load();
    } catch (e) { setError(e.message); }
    finally { setActionLoading(null); }
  };

  const filtered = soutenances.filter(s => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.binome?.etudiant1?.nom?.toLowerCase().includes(q) ||
      s.binome?.etudiant2?.nom?.toLowerCase().includes(q) ||
      s.affectation?.sujet?.titre?.toLowerCase().includes(q) ||
      s.creneau?.salle?.toLowerCase().includes(q)
    );
  });

  const terminees = soutenances.filter(s => s.statut === "TERMINEE");
  const moyenne = terminees.length > 0
    ? (terminees.reduce((acc, s) => acc + (s.note || 0), 0) / terminees.length).toFixed(1)
    : "—";

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        .s-card { transition: box-shadow 0.15s; }
        .s-card:hover { box-shadow: 0 2px 16px rgba(0,0,0,0.08); }
        .btn-act { transition: opacity 0.15s, transform 0.1s; cursor: pointer; }
        .btn-act:hover { opacity: 0.85; }
        .btn-act:active { transform: scale(0.97); }
      `}</style>

      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
          Phase 4
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: "var(--text)", letterSpacing: "-0.4px" }}>
          Planning des soutenances
        </h1>
      </div>

      <StatsBar stats={[
        { label: "Total",         value: soutenances.length,                                        color: "#3b82f6" },
        { label: "Planifiées",    value: soutenances.filter(s => s.statut === "PLANIFIEE").length,  total: soutenances.length, color: "#6366f1" },
        { label: "Terminées",     value: terminees.length,                                           total: soutenances.length, color: "#10b981" },
        { label: "Moy. générale", value: moyenne,                                                    color: "#f59e0b" },
      ]} />

      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <input
          placeholder="Rechercher binôme, sujet, salle..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1, minWidth: 220, padding: "8px 14px", borderRadius: 8,
            border: "1px solid var(--border2)", background: "var(--surface)",
            color: "var(--text)", outline: "none", fontSize: 13,
          }}
        />
        <input type="date"
          value={dateFilter}
          onChange={e => setDateFilter(e.target.value)}
          style={{
            padding: "8px 12px", borderRadius: 8,
            border: "1px solid var(--border2)", background: "var(--surface)",
            color: "var(--text)", outline: "none", fontSize: 13,
          }}
        />
        {dateFilter && (
          <button className="btn-act"
            onClick={() => setDateFilter("")}
            style={{
              padding: "8px 12px", borderRadius: 8,
              border: "1px solid var(--border2)", background: "var(--surface)",
              color: "var(--muted)", fontSize: 13,
            }}>
            Effacer
          </button>
        )}

      </div>

      {error && (
        <div style={{
          background: "#fee2e2", border: "1px solid #ef4444", color: "#991b1b",
          borderRadius: "var(--radius)", padding: "10px 14px",
          fontSize: 13, marginBottom: 16, fontWeight: 500,
        }}>
          {error}
        </div>
      )}

      {loading && <LoadingState />}

      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--muted)" }}>
          Aucune soutenance trouvée.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map(s => {
          const cfg    = STATUS_SOUTENANCE[s.statut];
          const isOpen = expandedId === s.id;
          return (
            <div key={s.id} className="s-card"
              style={{
                background: "var(--surface)",
                border: `1px solid ${cfg?.border || "var(--border2)"}`,
                borderLeft: `4px solid ${cfg?.border || "var(--border2)"}`,
                borderRadius: "var(--radius-lg)", overflow: "hidden",
              }}>
              <div
                onClick={() => setExpandedId(isOpen ? null : s.id)}
                style={{
                  display: "flex", alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 20px", cursor: "pointer",
                }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>
                    {s.binome?.etudiant1?.nom} & {s.binome?.etudiant2?.nom}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>
                    {s.affectation?.sujet?.titre}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ textAlign: "right", fontSize: 12, color: "var(--muted)", fontFamily: "'DM Mono', monospace" }}>
                    <div>{s.creneau?.date}</div>
                    <div>{s.creneau?.heureDebut} · {s.creneau?.salle}</div>
                  </div>
                  {s.note != null && (
                    <div style={{
                      fontFamily: "'DM Mono', monospace", fontSize: 15, fontWeight: 700,
                      color: s.note >= 10 ? "#065f46" : "#991b1b",
                      background: s.note >= 10 ? "#d1fae5" : "#fee2e2",
                      border: `1px solid ${s.note >= 10 ? "#10b981" : "#ef4444"}`,
                      padding: "3px 10px", borderRadius: 8,
                    }}>
                      {s.note}/20
                    </div>
                  )}
                  <Badge config={cfg} />
                  <span style={{ color: "var(--muted)", fontSize: 11 }}>{isOpen ? "▲" : "▼"}</span>
                </div>
              </div>

              {isOpen && (
                <div style={{
                  borderTop: `1px solid ${cfg?.border || "var(--border)"}`,
                  padding: "18px 20px",
                  background: cfg ? `${cfg.bg}50` : "var(--surface2)",
                }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "14px 32px", marginBottom: 18 }}>
                    <Field label="Encadrant"   value={s.affectation?.sujet?.encadrant?.nom} />
                    <Field label="Jury"        value={s.jury?.map(j => j.nom).join(", ")} />
                    <Field label="Salle"       value={s.creneau?.salle} />
                    <Field label="Heure début" value={s.creneau?.heureDebut} />
                    <Field label="Heure fin"   value={s.creneau?.heureFin} />
                    <Field label="Présence"    value={s.present == null ? "—" : s.present ? "Présent" : "Absent"} />
                  </div>

                  {s.observations && (
                    <div style={{
                      background: "#fef3c7", border: "1px solid #f59e0b",
                      borderRadius: 8, padding: "10px 14px",
                      fontSize: 13, color: "#92400e", marginBottom: 16,
                    }}>
                      {s.observations}
                    </div>
                  )}

                  {s.statut === "PLANIFIEE" && (
                    <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14 }}>
                      <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
                        Enregistrer le résultat
                      </div>
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                        <input type="number" min="0" max="20" step="0.5"
                          placeholder="Note /20"
                          value={resultatForm[s.id]?.note || ""}
                          onChange={e => setResultatForm(p => ({ ...p, [s.id]: { ...p[s.id], note: e.target.value } }))}
                          style={{
                            width: 100, padding: "7px 10px", borderRadius: 8,
                            border: "1px solid var(--border2)", background: "var(--surface)",
                            color: "var(--text)", outline: "none", fontSize: 13,
                          }}
                        />
                        <input
                          placeholder="Observations..."
                          value={resultatForm[s.id]?.observations || ""}
                          onChange={e => setResultatForm(p => ({ ...p, [s.id]: { ...p[s.id], observations: e.target.value } }))}
                          style={{
                            flex: 1, minWidth: 180, padding: "7px 12px", borderRadius: 8,
                            border: "1px solid var(--border2)", background: "var(--surface)",
                            color: "var(--text)", outline: "none", fontSize: 13,
                          }}
                        />
                        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--muted)", cursor: "pointer" }}>
                          <input type="checkbox" defaultChecked
                            onChange={e => setResultatForm(p => ({ ...p, [s.id]: { ...p[s.id], present: e.target.checked } }))}
                          />
                          Présent
                        </label>
                        <button className="btn-act"
                          onClick={() => handleResultat(s.id)}
                          disabled={actionLoading === s.id}
                          style={{
                            padding: "7px 16px", borderRadius: 8,
                            border: "none", background: "#10b981", color: "#fff",
                            fontSize: 13, fontWeight: 600,
                            opacity: actionLoading === s.id ? 0.6 : 1,
                          }}>
                          {actionLoading === s.id ? "..." : "Enregistrer"}
                        </button>
                      </div>
                    </div>
                  )}
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
          borderRadius: "var(--radius-lg)", height: 72, opacity: 1 - i * 0.2,
        }} />
      ))}
    </div>
  );
}