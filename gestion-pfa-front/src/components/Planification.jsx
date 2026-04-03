import { useState, useEffect, useCallback } from "react";
import { soutenanceApi, creneauApi, professeurApi, affectationApi } from "../api/api";
import StatsBar from "./StatsBar";
import { Badge, STATUS_SOUTENANCE } from "./Badges";

const inputStyle = {
  padding: "8px 12px", borderRadius: 8,
  border: "1px solid var(--border2)", background: "var(--surface2)",
  color: "var(--text)", outline: "none", fontSize: 13, width: "100%",
};

function FieldWrap({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

// ── Formulaire planification manuelle ────────────────
function FormulaireManuel({ affectation, creneaux, profs, onPlanifie, onClose }) {
  const [creneauId, setCreneauId]   = useState("");
  const [juryIds, setJuryIds]       = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);

  const encadrantId = affectation?.sujet?.encadrant?.id;

  // L'encadrant est automatiquement dans le jury
  useEffect(() => {
    if (encadrantId) setJuryIds([String(encadrantId)]);
  }, [encadrantId]);

  const toggleJury = (id) => {
    const sid = String(id);
    if (sid === String(encadrantId)) return; // encadrant non retirable
    setJuryIds(p => p.includes(sid) ? p.filter(x => x !== sid) : [...p, sid]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!creneauId) { setError("Sélectionnez un créneau."); return; }
    if (juryIds.length < 2) { setError("Le jury doit contenir au moins 2 membres."); return; }
    setLoading(true); setError(null);
    try {
      await soutenanceApi.planifier({
        affectationId: affectation.id,
        creneauId: parseInt(creneauId),
        juryIds: juryIds.map(Number),
      });
      onPlanifie();
      onClose();
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const creneauxDispo = creneaux.filter(c => c.statut === "DISPONIBLE");

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
    }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: "var(--surface)", borderRadius: "var(--radius-lg)",
        border: "1px solid var(--border2)", padding: "28px 32px",
        width: 520, maxHeight: "85vh", overflowY: "auto",
      }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>
          Planifier manuellement
        </div>
        <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 20 }}>
          {affectation?.binome?.etudiant1?.nom} & {affectation?.binome?.etudiant2?.nom}
          {" — "}{affectation?.sujet?.titre}
        </div>

        {error && (
          <div style={{ background: "#fee2e2", border: "1px solid #ef4444", color: "#991b1b", borderRadius: 8, padding: "10px 12px", fontSize: 13, marginBottom: 16, fontWeight: 500 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>

          {/* Créneau */}
          <FieldWrap label="Créneau disponible">
            <select value={creneauId} onChange={e => setCreneauId(e.target.value)} style={inputStyle}>
              <option value="">-- Sélectionner un créneau --</option>
              {creneauxDispo.map(c => (
                <option key={c.id} value={c.id}>
                  {c.date} · {c.heureDebut} — {c.heureFin} · {c.salle}
                </option>
              ))}
            </select>
            {creneauxDispo.length === 0 && (
              <div style={{ fontSize: 11, color: "#ef4444", marginTop: 4 }}>
                Aucun créneau disponible. Ajoutez-en dans la Phase 2.
              </div>
            )}
          </FieldWrap>

          {/* Jury */}
          <FieldWrap label={`Jury (${juryIds.length} sélectionné${juryIds.length > 1 ? "s" : ""})`}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {profs.map(p => {
                const isEncadrant = String(p.id) === String(encadrantId);
                const isSelected  = juryIds.includes(String(p.id));
                return (
                  <div key={p.id}
                    onClick={() => toggleJury(p.id)}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "10px 14px", borderRadius: 8, cursor: isEncadrant ? "default" : "pointer",
                      border: `1px solid ${isSelected ? "#3b82f6" : "var(--border2)"}`,
                      background: isSelected ? "#dbeafe" : "var(--surface2)",
                      transition: "all 0.15s",
                    }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: isSelected ? 600 : 400, color: isSelected ? "#1e40af" : "var(--text)" }}>
                        {p.nom}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--muted)" }}>{p.departement}</div>
                    </div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      {isEncadrant && (
                        <span style={{ fontSize: 10, background: "#dbeafe", color: "#1e40af", border: "1px solid #3b82f6", borderRadius: 20, padding: "2px 8px", fontWeight: 600 }}>
                          Encadrant
                        </span>
                      )}
                      <div style={{
                        width: 18, height: 18, borderRadius: 4,
                        border: `1.5px solid ${isSelected ? "#3b82f6" : "var(--border2)"}`,
                        background: isSelected ? "#3b82f6" : "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {isSelected && <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>✓</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </FieldWrap>

          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button type="submit" disabled={loading}
              style={{
                flex: 1, padding: "10px", borderRadius: 8,
                border: "none", background: "#3b82f6", color: "#fff",
                fontSize: 13, fontWeight: 600, cursor: "pointer",
                opacity: loading ? 0.6 : 1,
              }}>
              {loading ? "Planification..." : "Confirmer la planification"}
            </button>
            <button type="button" onClick={onClose}
              style={{
                padding: "10px 16px", borderRadius: 8,
                border: "1px solid var(--border2)", background: "transparent",
                color: "var(--muted)", fontSize: 13, cursor: "pointer",
              }}>
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Carte affectation à planifier ─────────────────────
function AffectationCard({ affectation, onManuel }) {
  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border2)",
      borderLeft: "4px solid #f59e0b",
      borderRadius: "var(--radius-lg)", padding: "18px 22px",
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 3 }}>
          {affectation.binome?.etudiant1?.nom} & {affectation.binome?.etudiant2?.nom}
        </div>
        <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>
          {affectation.sujet?.titre}
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "'DM Mono', monospace" }}>
            Moy. {affectation.binome?.moyenneBinome?.toFixed(2)} / 20
          </span>
          <span style={{ fontSize: 11, color: "var(--muted)" }}>
            Encadrant : {affectation.sujet?.encadrant?.nom}
          </span>
        </div>
      </div>
      <button onClick={() => onManuel(affectation)}
        style={{
          padding: "8px 16px", borderRadius: 8,
          border: "1px solid #3b82f6", background: "#dbeafe",
          color: "#1e40af", fontSize: 13, fontWeight: 600, cursor: "pointer",
          whiteSpace: "nowrap", transition: "opacity 0.15s",
        }}>
        Planifier
      </button>
    </div>
  );
}

// ── Carte soutenance planifiée ────────────────────────
function SoutenanceCard({ soutenance }) {
  const cfg = STATUS_SOUTENANCE[soutenance.statut] || STATUS_SOUTENANCE.PLANIFIEE;
  return (
    <div style={{
      background: "var(--surface)",
      border: `1px solid ${cfg.border}`,
      borderLeft: `4px solid ${cfg.border}`,
      borderRadius: "var(--radius-lg)", padding: "18px 22px",
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 3 }}>
          {soutenance.binome?.etudiant1?.nom} & {soutenance.binome?.etudiant2?.nom}
        </div>
        <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>
          {soutenance.affectation?.sujet?.titre}
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "var(--muted)" }}>
            {soutenance.creneau?.date} · {soutenance.creneau?.heureDebut}
          </span>
          <span style={{ fontSize: 11, color: "var(--muted)" }}>
            {soutenance.creneau?.salle}
          </span>
          <span style={{ fontSize: 11, color: "var(--muted)" }}>
            Jury : {soutenance.jury?.map(j => j.nom).join(", ") || "—"}
          </span>
        </div>
      </div>
      <Badge config={cfg} />
    </div>
  );
}

// ── Composant principal ───────────────────────────────
export default function Planification() {
  const [affectations, setAffectations]   = useState([]);
  const [soutenances, setSoutenances]     = useState([]);
  const [creneaux, setCreneaux]           = useState([]);
  const [profs, setProfs]                 = useState([]);
  const [loading, setLoading]             = useState(true);
  const [autoLoading, setAutoLoading]     = useState(false);
  const [error, setError]                 = useState(null);
  const [success, setSuccess]             = useState(null);
  const [modalAff, setModalAff]           = useState(null);
  const [activeTab, setActiveTab]         = useState("aplanifier");

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [affs, sous, cren, prs] = await Promise.all([
        affectationApi.getAll(),
        soutenanceApi.getPlanningFinal(),
        creneauApi.getAll(),
        professeurApi.getAll(),
      ]);
      setAffectations(affs);
      setSoutenances(sous);
      setCreneaux(cren);
      setProfs(prs);
      setError(null);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // Affectations validées sans soutenance encore planifiée
  const binomesDejaPlanes = new Set(soutenances.map(s => s.binome?.id));
  const aplanifier = affectations.filter(a =>
    a.statut === "VALIDEE" && !binomesDejaPlanes.has(a.binome?.id)
  );

  const handleAuto = async () => {
    setAutoLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await soutenanceApi.planifierAuto();
      const n = Array.isArray(res) ? res.length : 0;
      setSuccess(`${n} soutenance${n > 1 ? "s" : ""} planifiée${n > 1 ? "s" : ""} automatiquement.`);
      await loadAll();
    } catch (e) { setError(e.message); }
    finally { setAutoLoading(false); }
  };

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3000);
  };

  const totalValidees  = affectations.filter(a => a.statut === "VALIDEE").length;
  const totalPlanifiees = soutenances.length;
  const totalTerminees  = soutenances.filter(s => s.statut === "TERMINEE").length;

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {[1,2,3].map(i => <div key={i} style={{ height: 80, borderRadius: "var(--radius-lg)", background: "var(--surface)", border: "1px solid var(--border)", opacity: 1 - i * 0.2 }} />)}
    </div>
  );

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        .btn-act { transition: opacity 0.15s, transform 0.1s; cursor: pointer; }
        .btn-act:hover { opacity: 0.85; }
        .btn-act:active { transform: scale(0.97); }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
          Phase 3
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: "var(--text)", letterSpacing: "-0.4px" }}>
            Planification des soutenances
          </h1>
          {aplanifier.length > 0 && (
            <button className="btn-act"
              onClick={handleAuto}
              disabled={autoLoading}
              style={{
                padding: "9px 20px", borderRadius: 8,
                border: "none", background: "#6366f1", color: "#fff",
                fontSize: 13, fontWeight: 600,
                opacity: autoLoading ? 0.6 : 1,
              }}>
              {autoLoading ? "Planification en cours..." : `Planification automatique (${aplanifier.length})`}
            </button>
          )}
        </div>
      </div>

      <StatsBar stats={[
        { label: "Validées",   value: totalValidees,   color: "#10b981" },
        { label: "À planifier",value: aplanifier.length, total: totalValidees, color: "#f59e0b" },
        { label: "Planifiées", value: totalPlanifiees,  total: totalValidees, color: "#3b82f6" },
        { label: "Terminées",  value: totalTerminees,   total: totalValidees, color: "#6366f1" },
      ]} />

      {/* Alertes */}
      {error && (
        <div style={{ background: "#fee2e2", border: "1px solid #ef4444", color: "#991b1b", borderRadius: "var(--radius)", padding: "10px 14px", fontSize: 13, marginBottom: 16, fontWeight: 500 }}>
          {error}
          <button onClick={() => setError(null)} style={{ float: "right", background: "none", border: "none", color: "#991b1b", cursor: "pointer", fontWeight: 700 }}>x</button>
        </div>
      )}
      {success && (
        <div style={{ background: "#d1fae5", border: "1px solid #10b981", color: "#065f46", borderRadius: "var(--radius)", padding: "10px 14px", fontSize: 13, marginBottom: 16, fontWeight: 500 }}>
          {success}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 2, borderBottom: "2px solid var(--border)", marginBottom: 24 }}>
        {[
          { id: "aplanifier", label: `À planifier (${aplanifier.length})` },
          { id: "planifiees",  label: `Planifiées (${totalPlanifiees})` },
        ].map(t => (
          <button key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: "10px 18px", border: "none", background: "none", cursor: "pointer",
              fontSize: 13, fontWeight: activeTab === t.id ? 600 : 400,
              color: activeTab === t.id ? "#3b82f6" : "var(--muted)",
              borderBottom: activeTab === t.id ? "2px solid #3b82f6" : "2px solid transparent",
              marginBottom: -2,
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* À planifier */}
      {activeTab === "aplanifier" && (
        <div>
          {aplanifier.length === 0 ? (
            <div style={{
              textAlign: "center", padding: "60px 0",
              border: "1px dashed var(--border2)", borderRadius: "var(--radius-lg)",
            }}>
              <div style={{ fontSize: 15, fontWeight: 500, color: "var(--text)", marginBottom: 6 }}>
                Toutes les soutenances sont planifiées
              </div>
              <div style={{ fontSize: 13, color: "var(--muted)" }}>
                Rendez-vous dans l'onglet "Planifiées" pour voir le planning.
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12 }}>
                {aplanifier.length} affectation{aplanifier.length > 1 ? "s" : ""} validée{aplanifier.length > 1 ? "s" : ""} en attente de planification.
                Utilisez la planification automatique ou assignez manuellement chaque binôme.
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {aplanifier.map(a => (
                  <AffectationCard key={a.id} affectation={a} onManuel={setModalAff} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Planifiées */}
      {activeTab === "planifiees" && (
        <div>
          {soutenances.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "var(--muted)" }}>
              Aucune soutenance planifiée.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {soutenances.map(s => <SoutenanceCard key={s.id} soutenance={s} />)}
            </div>
          )}
        </div>
      )}

      {/* Modal planification manuelle */}
      {modalAff && (
        <FormulaireManuel
          affectation={modalAff}
          creneaux={creneaux}
          profs={profs}
          onPlanifie={() => { showSuccess("Soutenance planifiée avec succès."); loadAll(); }}
          onClose={() => setModalAff(null)}
        />
      )}
    </div>
  );
}