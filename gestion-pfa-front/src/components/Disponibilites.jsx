import { useState, useEffect, useCallback } from "react";
import { creneauApi, disponibiliteApi, professeurApi } from "../api/api";
import StatsBar from "./StatsBar";
import { Badge, STATUS_CRENEAU } from "./Badges";

const SALLES = ["Salle A1", "Salle A2", "Salle B1", "Amphithéâtre"];

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

// ── Vérificateur de disponibilité ─────────────────────
function VerificateurDispo() {
  const [profs, setProfs]               = useState([]);
  const [loadingProfs, setLoadingProfs] = useState(true);
  const [selectedProfId, setSelectedProfId] = useState("");
  const [date, setDate]                 = useState("");
  const [result, setResult]             = useState(null);
  const [checking, setChecking]         = useState(false);

  // Charge tous les profs au montage
  useEffect(() => {
    professeurApi.getAll()
      .then(data => setProfs(data))
      .catch(() => setProfs([]))
      .finally(() => setLoadingProfs(false));
  }, []);

  const selectedProf = profs.find(p => String(p.id) === String(selectedProfId));

  const handleCheck = async () => {
    if (!selectedProfId || !date) return;
    setChecking(true);
    setResult(null);
    try {
      const data = await professeurApi.checkDisponibilite(selectedProfId, date);
      setResult(data);
    } catch (e) {
      setResult({ error: e.message });
    } finally {
      setChecking(false);
    }
  };

  const handleAddDispo = async ({ date: d, heureDebut, heureFin }) => {
    await disponibiliteApi.enregistrer({
      professeur: { id: parseInt(selectedProfId) },
      date: d,
      heureDebut,
      heureFin,
      disponible: true,
    });
    await handleCheck();
  };

  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border2)",
      borderRadius: "var(--radius-lg)", padding: "24px",
    }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>
        Vérifier la disponibilité d'un professeur
      </div>
      <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 20 }}>
        Sélectionnez un professeur et une date pour vérifier sa disponibilité.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 12, alignItems: "end" }}>

        {/* Liste déroulante des profs */}
        <FieldWrap label="Professeur">
          {loadingProfs ? (
            <div style={{ ...inputStyle, color: "var(--muted)", display: "flex", alignItems: "center" }}>
              Chargement...
            </div>
          ) : (
            <select
              value={selectedProfId}
              onChange={e => { setSelectedProfId(e.target.value); setResult(null); }}
              style={inputStyle}
            >
              <option value="">-- Sélectionner un professeur --</option>
              {profs.map(p => (
                <option key={p.id} value={p.id}>
                  {p.nom} {p.departement ? `— ${p.departement}` : ""}
                </option>
              ))}
            </select>
          )}
        </FieldWrap>

        {/* Date */}
        <FieldWrap label="Date souhaitée">
          <input
            type="date"
            value={date}
            onChange={e => { setDate(e.target.value); setResult(null); }}
            style={inputStyle}
          />
        </FieldWrap>

        {/* Bouton */}
        <button
          onClick={handleCheck}
          disabled={!selectedProfId || !date || checking}
          style={{
            padding: "8px 20px", borderRadius: 8, height: 38,
            border: "none", background: "#3b82f6", color: "#fff",
            fontSize: 13, fontWeight: 600, cursor: "pointer",
            opacity: !selectedProfId || !date || checking ? 0.5 : 1,
            whiteSpace: "nowrap",
          }}>
          {checking ? "Vérification..." : "Vérifier"}
        </button>
      </div>

      {/* Résultat */}
      {result && !result.error && (
        <div style={{ marginTop: 20 }}>
          {result.disponible ? (
            <div style={{
              background: "#d1fae5", border: "1px solid #10b981",
              borderRadius: 10, padding: "16px 20px",
            }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#065f46", marginBottom: 8 }}>
                {selectedProf?.nom} est disponible le {date}
              </div>
              {result.plages?.filter(p => p.disponible).length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {result.plages.filter(p => p.disponible).map((p, i) => (
                    <div key={i} style={{ fontSize: 12, color: "#065f46", fontFamily: "'DM Mono', monospace" }}>
                      {p.heureDebut} — {p.heureFin}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{
                background: "#fee2e2", border: "1px solid #ef4444",
                borderRadius: 10, padding: "16px 20px",
              }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#991b1b", marginBottom: 4 }}>
                  {selectedProf?.nom} n'est pas disponible le {date}
                </div>
                <div style={{ fontSize: 12, color: "#991b1b" }}>
                  Aucune plage de disponibilité enregistrée pour cette date.
                </div>
              </div>

              {result.prochaineDatesDisponibles?.length > 0 ? (
                <div style={{
                  background: "#fef3c7", border: "1px solid #f59e0b",
                  borderRadius: 10, padding: "16px 20px",
                }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#92400e", marginBottom: 12 }}>
                    Prochaines dates disponibles
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {result.prochaineDatesDisponibles.map((d, i) => (
                      <div key={i} style={{
                        background: "#fff", border: "1px solid #f59e0b",
                        borderRadius: 8, padding: "12px 14px",
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        gap: 12,
                      }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#92400e", marginBottom: 4 }}>
                            {d.date}
                          </div>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            {d.plages.map((p, j) => (
                              <span key={j} style={{
                                fontSize: 11, fontFamily: "'DM Mono', monospace",
                                color: "#92400e", background: "#fef3c7",
                                border: "1px solid #f59e0b", borderRadius: 6,
                                padding: "2px 8px",
                              }}>
                                {p.heureDebut} — {p.heureFin}
                              </span>
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={() => { setDate(d.date); setResult(null); }}
                          style={{
                            padding: "6px 14px", borderRadius: 8, whiteSpace: "nowrap",
                            border: "1px solid #f59e0b", background: "#f59e0b",
                            color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer",
                          }}>
                          Utiliser
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{
                  background: "var(--surface2)", border: "1px solid var(--border2)",
                  borderRadius: 10, padding: "16px 20px",
                }}>
                  <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 12 }}>
                    Aucune disponibilité dans les 30 prochains jours. Ajouter une plage :
                  </div>
                  <QuickAddDispo date={date} onAdd={handleAddDispo} />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {result?.error && (
        <div style={{
          marginTop: 16, background: "#fee2e2", border: "1px solid #ef4444",
          borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#991b1b",
        }}>
          {result.error}
        </div>
      )}
    </div>
  );
}

// ── Ajout rapide de disponibilité ─────────────────────
function QuickAddDispo({ date, onAdd }) {
  const [heureDebut, setHeureDebut] = useState("08:00");
  const [heureFin, setHeureFin]     = useState("12:00");
  const [loading, setLoading]       = useState(false);

  const handleAdd = async () => {
    setLoading(true);
    try { await onAdd({ date, heureDebut: heureDebut + ":00", heureFin: heureFin + ":00" }); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "end", flexWrap: "wrap" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <label style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>De</label>
        <input type="time" value={heureDebut} onChange={e => setHeureDebut(e.target.value)} style={{ ...inputStyle, width: 120 }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <label style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>À</label>
        <input type="time" value={heureFin} onChange={e => setHeureFin(e.target.value)} style={{ ...inputStyle, width: 120 }} />
      </div>
      <button onClick={handleAdd} disabled={loading}
        style={{
          padding: "8px 16px", borderRadius: 8,
          border: "none", background: "#10b981", color: "#fff",
          fontSize: 13, fontWeight: 600, cursor: "pointer",
          opacity: loading ? 0.6 : 1,
        }}>
        {loading ? "..." : "Ajouter"}
      </button>
    </div>
  );
}

// ── Formulaire créneau ────────────────────────────────
function FormulaireCreneaux({ onCreated }) {
  const [form, setForm]       = useState({ date: "", heureDebut: "", dureeMinutes: "30", salle: "Salle A1" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.date || !form.heureDebut) { setError("Date et heure obligatoires."); return; }
    setLoading(true); setError(null);
    try {
      await creneauApi.creer({
        date: form.date,
        heureDebut: form.heureDebut + ":00",
        dureeMinutes: parseInt(form.dureeMinutes),
        salle: form.salle,
      });
      setForm({ date: "", heureDebut: "", dureeMinutes: "30", salle: "Salle A1" });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
      onCreated();
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border2)",
      borderRadius: "var(--radius-lg)", padding: "20px",
      position: "sticky", top: 24,
    }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>Nouveau créneau</div>
      <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 16 }}>Définir une plage pour une soutenance</div>

      {error   && <div style={{ background: "#fee2e2", border: "1px solid #ef4444", color: "#991b1b", borderRadius: 8, padding: "8px 12px", fontSize: 12, marginBottom: 12 }}>{error}</div>}
      {success && <div style={{ background: "#d1fae5", border: "1px solid #10b981", color: "#065f46", borderRadius: 8, padding: "8px 12px", fontSize: 12, marginBottom: 12, fontWeight: 500 }}>Créneau créé.</div>}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <FieldWrap label="Date"><input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} style={inputStyle} /></FieldWrap>
        <FieldWrap label="Heure de début"><input type="time" value={form.heureDebut} onChange={e => setForm(p => ({ ...p, heureDebut: e.target.value }))} style={inputStyle} /></FieldWrap>
        <FieldWrap label="Durée">
          <select value={form.dureeMinutes} onChange={e => setForm(p => ({ ...p, dureeMinutes: e.target.value }))} style={inputStyle}>
            <option value="20">20 minutes</option>
            <option value="30">30 minutes</option>
            <option value="45">45 minutes</option>
            <option value="60">60 minutes</option>
          </select>
        </FieldWrap>
        <FieldWrap label="Salle">
          <select value={form.salle} onChange={e => setForm(p => ({ ...p, salle: e.target.value }))} style={inputStyle}>
            {SALLES.map(s => <option key={s}>{s}</option>)}
          </select>
        </FieldWrap>
        <button type="submit" disabled={loading} style={{ marginTop: 4, padding: "10px", borderRadius: 8, border: "none", background: "#3b82f6", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: loading ? 0.6 : 1 }}>
          {loading ? "Création..." : "Créer le créneau"}
        </button>
      </form>
    </div>
  );
}

// ── Composant principal ───────────────────────────────
export default function Disponibilites() {
  const [creneaux, setCreneaux]           = useState([]);
  const [loadingC, setLoadingC]           = useState(true);
  const [activeTab, setActiveTab]         = useState("disponibilites");
  const [filterSalle, setFilterSalle]     = useState("TOUT");
  const [filterStatut, setFilterStatut]   = useState("TOUT");

  const loadCreneaux = useCallback(async () => {
    setLoadingC(true);
    try { setCreneaux(await creneauApi.getAll()); }
    catch (e) { console.error(e); }
    finally { setLoadingC(false); }
  }, []);

  useEffect(() => { loadCreneaux(); }, [loadCreneaux]);

  const filteredCreneaux = creneaux.filter(c => {
    const salleOk  = filterSalle  === "TOUT" || c.salle  === filterSalle;
    const statutOk = filterStatut === "TOUT" || c.statut === filterStatut;
    return salleOk && statutOk;
  });

  const countDispo  = creneaux.filter(c => c.statut === "DISPONIBLE").length;
  const countOccupe = creneaux.filter(c => c.statut === "OCCUPE").length;

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        input[type="date"]::-webkit-calendar-picker-indicator,
        input[type="time"]::-webkit-calendar-picker-indicator { cursor: pointer; opacity: 0.6; }
      `}</style>

      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Phase 2</div>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: "var(--text)", letterSpacing: "-0.4px" }}>Disponibilités & Créneaux</h1>
      </div>

      <StatsBar stats={[
        { label: "Total créneaux", value: creneaux.length, color: "#3b82f6" },
        { label: "Disponibles",    value: countDispo,  total: creneaux.length, color: "#10b981" },
        { label: "Occupés",        value: countOccupe, total: creneaux.length, color: "#f59e0b" },
      ]} />

      {/* Tabs */}
      <div style={{ display: "flex", gap: 2, borderBottom: "2px solid var(--border)", marginBottom: 24 }}>
        {[
          { id: "disponibilites", label: "Disponibilités des profs" },
          { id: "creneaux",       label: "Créneaux de soutenance"   },
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

      {activeTab === "disponibilites" && <VerificateurDispo />}

      {activeTab === "creneaux" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24, alignItems: "start" }}>
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
              <select value={filterSalle} onChange={e => setFilterSalle(e.target.value)} style={{ ...inputStyle, width: "auto" }}>
                <option value="TOUT">Toutes les salles</option>
                {SALLES.map(s => <option key={s}>{s}</option>)}
              </select>
              <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)} style={{ ...inputStyle, width: "auto" }}>
                <option value="TOUT">Tous les statuts</option>
                <option value="DISPONIBLE">Disponible</option>
                <option value="OCCUPE">Occupé</option>
              </select>
              <div style={{ fontSize: 12, color: "var(--muted)", marginLeft: 4 }}>
                {filteredCreneaux.length} créneau{filteredCreneaux.length !== 1 ? "x" : ""}
              </div>
            </div>

            {loadingC ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[1,2,3].map(i => <div key={i} style={{ height: 62, borderRadius: "var(--radius)", background: "var(--surface)", border: "1px solid var(--border)", opacity: 1 - i * 0.2 }} />)}
              </div>
            ) : filteredCreneaux.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 0", color: "var(--muted)" }}>Aucun créneau trouvé.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {filteredCreneaux.map(c => {
                  const cfg = STATUS_CRENEAU[c.statut] || STATUS_CRENEAU.DISPONIBLE;
                  return (
                    <div key={c.id} style={{
                      background: "var(--surface)",
                      border: `1px solid ${cfg.border}`,
                      borderLeft: `4px solid ${cfg.border}`,
                      borderRadius: "var(--radius)", padding: "14px 18px",
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                    }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 3 }}>{c.salle}</div>
                        <div style={{ fontSize: 12, color: "var(--muted)", fontFamily: "'DM Mono', monospace" }}>
                          {c.date} · {c.heureDebut} — {c.heureFin} · {c.dureeMinutes} min
                        </div>
                      </div>
                      <Badge config={cfg} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <FormulaireCreneaux onCreated={loadCreneaux} />
        </div>
      )}
    </div>
  );
}