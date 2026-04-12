import { useState, useEffect, useCallback } from "react";
import DisponibilitesProfs from "./DisponibilitesProfs";
import { Calendar, MapPin, Users, Clock, CheckCircle, Filter, List } from "lucide-react";
import { creneauApi, professeurApi } from "../api/api";
import { StatBar, PageHeader, Tabs, Card, Alert, LoadingSkeleton, EmptyState } from "./ui";

const DUREES = [
  { val: "20", label: "20 min" },
  { val: "30", label: "30 min" },
  { val: "45", label: "45 min" },
  { val: "60", label: "60 min" },
];

const SALLES_CONFIG = ["Salle A1", "Salle A2", "Salle B1", "Amphithéâtre"];

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

function StepIndicator({ step }) {
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
      {[
        { n: 1, label: "Date & heure" },
        { n: 2, label: "Choisir salle" },
        { n: 3, label: "Jury & confirmer" },
      ].map((s, i) => {
        const done   = step > s.n;
        const active = step === s.n;
        return (
          <div key={s.n} style={{ display: "flex", alignItems: "center", flex: i < 2 ? 1 : "none" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: done ? "#10b981" : active ? "#3b82f6" : "var(--surface2)",
                border: `2px solid ${done ? "#10b981" : active ? "#3b82f6" : "var(--border2)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700,
                color: done || active ? "#fff" : "var(--muted)",
                transition: "all 0.2s",
              }}>
                {done ? "✓" : s.n}
              </div>
              <div style={{ fontSize: 10, color: active ? "#3b82f6" : "var(--muted)", fontWeight: active ? 600 : 400, whiteSpace: "nowrap" }}>
                {s.label}
              </div>
            </div>
            {i < 2 && (
              <div style={{ flex: 1, height: 2, background: done ? "#10b981" : "var(--border2)", margin: "0 8px", marginBottom: 16, transition: "background 0.2s" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function CreateurCreneau({ onCreated }) {
  const [step, setStep]                 = useState(1);
  const [date, setDate]                 = useState("");
  const [heureDebut, setHeureDebut]     = useState("");
  const [duree, setDuree]               = useState("30");
  const [sallesLibres, setSallesLibres] = useState([]);
  const [salleChoisie, setSalleChoisie] = useState(null);
  const [profsDispos, setProfsDispos]   = useState([]);
  const [juryIds, setJuryIds]           = useState([]);
  const [loading, setLoading]           = useState(false);
  const [creating, setCreating]         = useState(false);
  const [error, setError]               = useState(null);
  const [success, setSuccess]           = useState(false);

  const heureFin = heureDebut
    ? (() => {
        const [h, m] = heureDebut.split(":").map(Number);
        const total  = h * 60 + m + parseInt(duree);
        return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
      })()
    : "";

  const handleCheckSalles = async () => {
    if (!date || !heureDebut) { setError("Date et heure obligatoires."); return; }
    setLoading(true); setError(null);
    try {
      const libres = await creneauApi.sallesLibres(date, heureDebut, parseInt(duree));
      setSallesLibres(libres);
      setSalleChoisie(null);
      setProfsDispos([]);
      setJuryIds([]);
      setStep(2);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const handleChoixSalle = async (salle) => {
    setSalleChoisie(salle);
    setLoading(true);
    try {
      const profs = await creneauApi.profsDispos(date, heureDebut, heureFin);
      setProfsDispos(profs);
      // Pré-sélectionner uniquement les profs disponibles
      setJuryIds(profs.filter(p => p.disponible).map(p => String(p.id)));
      setStep(3);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const toggleProf = (prof) => {
    // Bloquer si indisponible
    if (!prof.disponible) return;
    const sid = String(prof.id);
    setJuryIds(p => p.includes(sid) ? p.filter(x => x !== sid) : [...p, sid]);
  };

  const handleCreer = async () => {
    if (juryIds.length === 0) { setError("Sélectionnez au moins un professeur pour le jury."); return; }
    setCreating(true); setError(null);
    try {
      await creneauApi.creer({
        date,
        heureDebut: heureDebut + ":00",
        dureeMinutes: parseInt(duree),
        salle: salleChoisie,
        juryIds: juryIds.map(Number),
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setStep(1);
        setDate(""); setHeureDebut(""); setDuree("30");
        setSallesLibres([]); setSalleChoisie(null);
        setProfsDispos([]); setJuryIds([]);
        onCreated();
      }, 1500);
    } catch (e) { setError(e.message); }
    finally { setCreating(false); }
  };

  const reset = () => {
    setStep(1); setDate(""); setHeureDebut(""); setDuree("30");
    setSallesLibres([]); setSalleChoisie(null);
    setProfsDispos([]); setJuryIds([]);
    setError(null);
  };

  const profsSelectionnes = profsDispos.filter(p => juryIds.includes(String(p.id)));

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border2)", borderRadius: 14, padding: "24px" }}>
      <StepIndicator step={step} />

      {error && (
        <div style={{ background: "#fee2e2", border: "1px solid #ef4444", color: "#991b1b", borderRadius: 8, padding: "8px 12px", fontSize: 12, marginBottom: 14 }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ background: "#d1fae5", border: "1px solid #10b981", color: "#065f46", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 14, fontWeight: 600, textAlign: "center" }}>
          Créneau créé avec succès.
        </div>
      )}

      {/* ÉTAPE 1 */}
      {step === 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <FieldWrap label="Date">
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} />
          </FieldWrap>
          <FieldWrap label="Heure de début">
            <input type="time" value={heureDebut} onChange={e => setHeureDebut(e.target.value)} style={inputStyle} />
          </FieldWrap>
          <FieldWrap label="Durée">
            <select value={duree} onChange={e => setDuree(e.target.value)} style={inputStyle}>
              {DUREES.map(d => <option key={d.val} value={d.val}>{d.label}</option>)}
            </select>
          </FieldWrap>
          {heureDebut && (
            <div style={{ fontSize: 12, color: "var(--muted)", background: "var(--surface2)", borderRadius: 8, padding: "8px 12px", fontFamily: "'DM Mono', monospace" }}>
              {heureDebut} → {heureFin}
            </div>
          )}
          <button onClick={handleCheckSalles} disabled={loading || !date || !heureDebut}
            style={{ padding: "11px", borderRadius: 8, border: "none", background: "#3b82f6", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: !date || !heureDebut ? 0.5 : 1 }}>
            {loading ? "Vérification..." : "Voir les salles"}
          </button>
        </div>
      )}

      {/* ÉTAPE 2 */}
      {step === 2 && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", marginBottom: 4 }}>
            {date} · {heureDebut} → {heureFin}
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 14 }}>
            Vert = libre · Ambre = déjà un créneau (sélectionnable quand même)
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
            {SALLES_CONFIG.map(salle => {
              const libre = sallesLibres.includes(salle);
              return (
                <div key={salle} onClick={() => !loading && handleChoixSalle(salle)}
                  style={{
                    padding: "14px 18px", borderRadius: 10, cursor: "pointer",
                    border: `1px solid ${libre ? "#10b981" : "#f59e0b"}`,
                    background: libre ? "#d1fae5" : "#fef3c7",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    opacity: loading ? 0.6 : 1,
                    transition: "transform 0.1s",
                  }}
                  onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "none"; }}
                >
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: libre ? "#065f46" : "#92400e" }}>{salle}</div>
                    <div style={{ fontSize: 11, color: libre ? "#10b981" : "#f59e0b", marginTop: 2 }}>
                      {libre ? "Disponible" : "Créneau existant — sélectionner quand même ?"}
                    </div>
                  </div>
                  <span style={{ fontSize: 16, color: libre ? "#10b981" : "#f59e0b" }}>→</span>
                </div>
              );
            })}
          </div>
          <button onClick={reset}
            style={{ width: "100%", padding: "8px", borderRadius: 8, border: "1px solid var(--border2)", background: "transparent", color: "var(--muted)", fontSize: 13, cursor: "pointer" }}>
            Modifier la date / heure
          </button>
        </div>
      )}

      {/* ÉTAPE 3 */}
      {step === 3 && (
        <div>
          {/* Récap */}
          <div style={{ background: "#dbeafe", border: "1px solid #3b82f6", borderRadius: 10, padding: "14px 16px", marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#1e40af", marginBottom: 4 }}>Créneau à créer</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#1e40af" }}>{salleChoisie}</div>
            <div style={{ fontSize: 12, color: "#3b82f6", marginTop: 3, fontFamily: "'DM Mono', monospace" }}>
              {date} · {heureDebut} — {heureFin} · {duree} min
            </div>
          </div>

          {/* Sélection jury */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>
              Sélectionner le jury
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 10 }}>
              Les profs indisponibles ne peuvent pas être sélectionnés.
              {juryIds.length > 0 && (
                <span style={{ color: "#3b82f6", fontWeight: 600, marginLeft: 6 }}>
                  {juryIds.length} sélectionné{juryIds.length > 1 ? "s" : ""}
                </span>
              )}
            </div>

            {loading ? (
              <div style={{ fontSize: 13, color: "var(--muted)" }}>Chargement...</div>
            ) : profsDispos.length === 0 ? (
              <div style={{ fontSize: 13, color: "var(--muted)", padding: "12px", background: "var(--surface2)", borderRadius: 8 }}>
                Aucune donnée de disponibilité pour ce jour.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {profsDispos.map(p => {
                  const isSelected  = juryIds.includes(String(p.id));
                  const isIndispo   = !p.disponible;
                  return (
                    <div key={p.id}
                      onClick={() => toggleProf(p)}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "10px 14px", borderRadius: 8,
                        cursor: isIndispo ? "not-allowed" : "pointer",
                        border: `1px solid ${isIndispo ? "#fca5a5" : isSelected ? "#3b82f6" : "#10b981"}`,
                        background: isIndispo ? "#fef2f2" : isSelected ? "#dbeafe" : "#f0fdf4",
                        opacity: isIndispo ? 0.6 : 1,
                        transition: "all 0.15s",
                      }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: isSelected ? 600 : 400, color: isIndispo ? "#991b1b" : isSelected ? "#1e40af" : "#065f46" }}>
                          {p.nom}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--muted)" }}>{p.departement}</div>
                      </div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span style={{
                          fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20,
                          background: isIndispo ? "#ef4444" : "#10b981", color: "#fff",
                        }}>
                          {isIndispo ? "Indisponible" : "Disponible"}
                        </span>
                        {!isIndispo && (
                          <div style={{
                            width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                            border: `1.5px solid ${isSelected ? "#3b82f6" : "var(--border2)"}`,
                            background: isSelected ? "#3b82f6" : "transparent",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            {isSelected && <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>✓</span>}
                          </div>
                        )}
                        {isIndispo && (
                          <div style={{
                            width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                            background: "#fca5a5", display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>✕</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Récap jury sélectionné */}
          {juryIds.length > 0 && (
            <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "10px 14px", marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: "#1e40af", fontWeight: 600, marginBottom: 4 }}>Jury du créneau :</div>
              <div style={{ fontSize: 12, color: "#1e40af" }}>
                {profsSelectionnes.map(p => p.nom).join(" · ")}
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={handleCreer} disabled={creating || juryIds.length === 0}
              style={{
                flex: 1, padding: "11px", borderRadius: 8, border: "none",
                background: juryIds.length === 0 ? "var(--surface2)" : "#10b981",
                color: juryIds.length === 0 ? "var(--muted)" : "#fff",
                fontSize: 13, fontWeight: 600, cursor: juryIds.length === 0 ? "not-allowed" : "pointer",
                opacity: creating ? 0.6 : 1,
              }}>
              {creating ? "Création..." : juryIds.length === 0 ? "Sélectionnez au moins 1 prof" : "Créer ce créneau"}
            </button>
            <button onClick={() => setStep(2)}
              style={{ padding: "11px 16px", borderRadius: 8, border: "1px solid var(--border2)", background: "transparent", color: "var(--muted)", fontSize: 13, cursor: "pointer" }}>
              Retour
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function VerificateurDispo() {
  const [profs, setProfs]           = useState([]);
  const [loadingProfs, setLoadingProfs] = useState(true);
  const [selectedProfId, setSelectedProfId] = useState("");
  const [date, setDate]             = useState("");
  const [result, setResult]         = useState(null);
  const [checking, setChecking]     = useState(false);

  useEffect(() => {
    professeurApi.getAll().then(setProfs).catch(() => {}).finally(() => setLoadingProfs(false));
  }, []);

  const selectedProf = profs.find(p => String(p.id) === String(selectedProfId));

  const handleCheck = async () => {
    if (!selectedProfId || !date) return;
    setChecking(true); setResult(null);
    try {
      const data = await professeurApi.checkDisponibilite(selectedProfId, date);
      setResult(data);
    } catch (e) { setResult({ error: e.message }); }
    finally { setChecking(false); }
  };

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border2)", borderRadius: 14, padding: "24px" }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>Vérifier la disponibilité</div>
      <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 16 }}>Sélectionnez un professeur et une date</div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 14 }}>
        <FieldWrap label="Professeur">
          {loadingProfs ? (
            <div style={{ ...inputStyle, color: "var(--muted)" }}>Chargement...</div>
          ) : (
            <select value={selectedProfId} onChange={e => { setSelectedProfId(e.target.value); setResult(null); }} style={inputStyle}>
              <option value="">-- Sélectionner --</option>
              {profs.map(p => <option key={p.id} value={p.id}>{p.nom} — {p.departement}</option>)}
            </select>
          )}
        </FieldWrap>
        <FieldWrap label="Date">
          <input type="date" value={date} onChange={e => { setDate(e.target.value); setResult(null); }} style={inputStyle} />
        </FieldWrap>
        <button onClick={handleCheck} disabled={!selectedProfId || !date || checking}
          style={{ padding: "10px", borderRadius: 8, border: "none", background: "#3b82f6", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: !selectedProfId || !date ? 0.5 : 1 }}>
          {checking ? "Vérification..." : "Vérifier"}
        </button>
      </div>

      {result && !result.error && (
        result.disponible ? (
          <div style={{ background: "#d1fae5", border: "1px solid #10b981", borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#065f46", marginBottom: 6 }}>
              {selectedProf?.nom} est disponible le {date}
            </div>
            {result.plages?.map((p, i) => (
              <div key={i} style={{ fontSize: 12, color: "#065f46", fontFamily: "'DM Mono', monospace" }}>
                {p.heureDebut} — {p.heureFin}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ background: "#fee2e2", border: "1px solid #ef4444", borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#991b1b" }}>
                {selectedProf?.nom} n'est pas disponible le {date}
              </div>
            </div>
            {result.prochaineDatesDisponibles?.length > 0 && (
              <div style={{ background: "#fef3c7", border: "1px solid #f59e0b", borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#92400e", marginBottom: 10 }}>Prochaines dates disponibles</div>
                {result.prochaineDatesDisponibles.map((d, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, padding: "8px 12px", background: "#fff", borderRadius: 8, border: "1px solid #f59e0b" }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#92400e" }}>{d.date}</div>
                      {d.plages?.map((p, j) => (
                        <div key={j} style={{ fontSize: 11, color: "#f59e0b", fontFamily: "'DM Mono', monospace" }}>{p.heureDebut} — {p.heureFin}</div>
                      ))}
                    </div>
                    <button onClick={() => setDate(d.date)}
                      style={{ padding: "5px 12px", borderRadius: 8, border: "1px solid #f59e0b", background: "#f59e0b", color: "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                      Utiliser
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
}

export default function Disponibilites() {
  const [creneaux, setCreneaux]         = useState([]);
  const [loadingC, setLoadingC]         = useState(true);
  const [activeTab, setActiveTab]       = useState("creer");
  const [filterSalle, setFilterSalle]   = useState("TOUT");
  const [filterStatut, setFilterStatut] = useState("TOUT");

  const loadCreneaux = useCallback(async () => {
    setLoadingC(true);
    try { setCreneaux(await creneauApi.getAll()); }
    catch (e) { console.error(e); }
    finally { setLoadingC(false); }
  }, []);

  useEffect(() => { loadCreneaux(); }, [loadCreneaux]);

  // Only show creneaux that have jury + salle (valid creneaux)
  const creneauxValides = creneaux.filter(c => c.jury?.length > 0 && c.salle);
  const filteredCreneaux = creneauxValides.filter(c => {
    const salleOk  = filterSalle  === "TOUT" || c.salle  === filterSalle;
    const statutOk = filterStatut === "TOUT" || c.statut === filterStatut;
    return salleOk && statutOk;
  });

  const countDispo  = creneauxValides.filter(c => c.statut === "DISPONIBLE").length;
  const countOccupe = creneauxValides.filter(c => c.statut === "OCCUPE").length;

  const TABS = [
    { id: "creer",  label: "Créer un créneau",         icon: Calendar },
    { id: "dispos", label: "Disponibilités des profs",  icon: Users    },
    { id: "liste",  label: "Tous les créneaux",         icon: List },
  ];

  return (
    <div style={{ animation: "fadeUp 0.4s cubic-bezier(0.16,1,0.3,1)" }}>
      <style>{`input[type="date"]::-webkit-calendar-picker-indicator,input[type="time"]::-webkit-calendar-picker-indicator{cursor:pointer;opacity:0.6}`}</style>

      <PageHeader phase={2} title="Disponibilités & Créneaux" subtitle="Créez des créneaux et vérifiez la disponibilité des professeurs" />

      <StatBar stats={[
        { label: "Créneaux valides", value: creneauxValides.length,                              color: "var(--blue-600)" },
        { label: "Disponibles",    value: countDispo,  total: creneaux.length,          color: "var(--green)"    },
        { label: "Occupés",        value: countOccupe, total: creneaux.length,          color: "var(--amber)"    },
      ]} />

      <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

      {activeTab === "creer"  && <CreateurCreneau onCreated={loadCreneaux} />}
      {activeTab === "dispos" && <DisponibilitesProfs />}

      {activeTab === "liste" && (
        <div>
          <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
            <select value={filterSalle} onChange={e => setFilterSalle(e.target.value)}
              style={{ ...inputStyle, width: "auto", padding: "7px 12px" }}>
              <option value="TOUT">Toutes les salles</option>
              {SALLES_CONFIG.map(s => <option key={s}>{s}</option>)}
            </select>
            <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)}
              style={{ ...inputStyle, width: "auto", padding: "7px 12px" }}>
              <option value="TOUT">Tous les statuts</option>
              <option value="DISPONIBLE">Disponible</option>
              <option value="OCCUPE">Occupé</option>
            </select>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>
              {filteredCreneaux.length} créneau{filteredCreneaux.length !== 1 ? "x" : ""}
            </div>
          </div>

          {loadingC ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[1,2,3].map(i => <div key={i} style={{ height: 72, borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border)", opacity: 1 - i * 0.2 }} />)}
            </div>
          ) : filteredCreneaux.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 0", color: "var(--muted)" }}>Aucun créneau trouvé.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filteredCreneaux.map(c => {
                const isOccupe = c.statut === "OCCUPE";
                const juryNoms = c.jury?.map(j => j.nom).join(" · ") || "Aucun jury";
                return (
                  <div key={c.id} style={{
                    background: "var(--surface)",
                    border: `1px solid ${isOccupe ? "#f59e0b" : "#10b981"}`,
                    borderLeft: `4px solid ${isOccupe ? "#f59e0b" : "#10b981"}`,
                    borderRadius: 10, padding: "14px 18px",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    gap: 16,
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 3 }}>
                        {c.salle}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--muted)", fontFamily: "'DM Mono', monospace", marginBottom: 4 }}>
                        {c.date} · {c.heureDebut} — {c.heureFin} · {c.dureeMinutes} min
                      </div>
                      <div style={{ fontSize: 11, color: "#3b82f6", fontWeight: 500 }}>
                        Jury : {juryNoms}
                      </div>
                    </div>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, whiteSpace: "nowrap",
                      background: isOccupe ? "#fef3c7" : "#d1fae5",
                      color: isOccupe ? "#92400e" : "#065f46",
                      border: `1px solid ${isOccupe ? "#f59e0b" : "#10b981"}`,
                    }}>
                      {isOccupe ? "Occupé" : "Disponible"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}