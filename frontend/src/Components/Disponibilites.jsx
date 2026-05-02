import { useState, useEffect, useCallback } from "react";
import { creneauApi, professeurApi } from "../api/api";
import { PageHeader, Tabs, Alert, LoadingSkeleton, EmptyState } from "./ui";
import { Calendar, Users, List } from "lucide-react";
import DisponibilitesProfs from "./DisponibilitesProfs";

const DUREES = [
  { val: "20", label: "20 min" },
  { val: "30", label: "30 min" },
  { val: "45", label: "45 min" },
  { val: "60", label: "60 min" },
];

const SALLES_CONFIG = ["Salle A1", "Salle A2", "Salle B1", "Amphithéâtre"];

const inputStyle = {
  padding: "9px 12px", borderRadius: 10,
  border: "1px solid var(--border2)", background: "var(--surface)",
  color: "var(--text)", outline: "none", fontSize: 13, width: "100%",
  boxSizing: "border-box", boxShadow: "var(--shadow-xs)",
  transition: "border-color 0.15s, box-shadow 0.15s",
};

function FieldWrap({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{
        fontSize: 11, fontWeight: 700, color: "var(--text-3)",
        textTransform: "uppercase", letterSpacing: "0.06em",
      }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function StepIndicator({ step }) {
  const steps = [
    { n: 1, label: "Date & heure" },
    { n: 2, label: "Choisir salle" },
    { n: 3, label: "Jury & confirmer" },
  ];
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 28 }}>
      {steps.map((s, i) => {
        const done   = step > s.n;
        const active = step === s.n;
        return (
          <div key={s.n} style={{ display: "flex", alignItems: "center", flex: i < 2 ? 1 : "none" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: done ? "var(--green)" : active ? "var(--blue-600)" : "var(--surface2)",
                border: `2px solid ${done ? "var(--green)" : active ? "var(--blue-600)" : "var(--border2)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 700,
                color: done || active ? "#fff" : "var(--text-4)",
                transition: "all 0.2s",
                boxShadow: active ? "var(--shadow-blue)" : "none",
              }}>
                {done ? "✓" : s.n}
              </div>
              <div style={{
                fontSize: 11, fontWeight: active ? 700 : 400,
                color: active ? "var(--blue-600)" : done ? "var(--green-text)" : "var(--text-4)",
                whiteSpace: "nowrap",
              }}>
                {s.label}
              </div>
            </div>
            {i < 2 && (
              <div style={{
                flex: 1, height: 2,
                background: done ? "var(--green)" : "var(--border2)",
                margin: "0 10px 20px 10px",
                transition: "background 0.3s",
              }} />
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
      setJuryIds(profs.filter(p => p.disponible).map(p => String(p.id)));
      setStep(3);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const toggleProf = (prof) => {
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
      }, 1800);
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
    <div style={{
      background: "var(--surface)", borderRadius: "var(--r-xl)",
      border: "1px solid var(--border2)", padding: "28px 32px",
      boxShadow: "var(--shadow-sm)",
    }}>
      <StepIndicator step={step} />

      {error && (
        <div style={{
          background: "var(--red-bg)", border: "1px solid var(--red)",
          color: "var(--red-text)", borderRadius: "var(--r-md)",
          padding: "10px 14px", fontSize: 13, fontWeight: 500, marginBottom: 20,
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          background: "var(--green-bg)", border: "1px solid var(--green)",
          color: "var(--green-text)", borderRadius: "var(--r-md)",
          padding: "12px 16px", fontSize: 14, fontWeight: 700,
          marginBottom: 20, textAlign: "center",
        }}>
          Créneau créé avec succès ✓
        </div>
      )}

      {/* ── STEP 1: Date & heure ── */}
      {step === 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <FieldWrap label="Date de la soutenance">
            <input type="date" value={date}
              onChange={e => setDate(e.target.value)}
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = "var(--blue-500)"; e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.12)"; }}
              onBlur={e => { e.target.style.borderColor = "var(--border2)"; e.target.style.boxShadow = "var(--shadow-xs)"; }}
            />
          </FieldWrap>
          <FieldWrap label="Heure de début">
            <input type="time" value={heureDebut}
              onChange={e => setHeureDebut(e.target.value)}
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = "var(--blue-500)"; e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.12)"; }}
              onBlur={e => { e.target.style.borderColor = "var(--border2)"; e.target.style.boxShadow = "var(--shadow-xs)"; }}
            />
          </FieldWrap>
          <FieldWrap label="Durée">
            <select value={duree} onChange={e => setDuree(e.target.value)} style={inputStyle}>
              {DUREES.map(d => <option key={d.val} value={d.val}>{d.label}</option>)}
            </select>
          </FieldWrap>

          {heureDebut && (
            <div style={{
              background: "var(--blue-50)", border: "1px solid var(--blue-200)",
              borderRadius: "var(--r-md)", padding: "10px 14px",
              fontSize: 13, color: "var(--blue-700)", fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 600,
            }}>
              Créneau : {heureDebut} → {heureFin}
            </div>
          )}

          <button onClick={handleCheckSalles}
            disabled={loading || !date || !heureDebut}
            style={{
              padding: "12px", borderRadius: "var(--r-md)", border: "none",
              background: !date || !heureDebut ? "var(--surface3)" : "var(--blue-600)",
              color: !date || !heureDebut ? "var(--text-4)" : "#fff",
              fontSize: 14, fontWeight: 700, cursor: !date || !heureDebut ? "not-allowed" : "pointer",
              boxShadow: !date || !heureDebut ? "none" : "var(--shadow-blue)",
              transition: "all 0.15s",
            }}>
            {loading ? "Vérification..." : "Voir les salles disponibles →"}
          </button>
        </div>
      )}

      {/* ── STEP 2: Choisir salle ── */}
      {step === 2 && (
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>
            {date} · {heureDebut} → {heureFin}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 20 }}>
            Vert = libre · Ambre = créneau existant (sélectionnable quand même)
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            {SALLES_CONFIG.map(salle => {
              const libre = sallesLibres.includes(salle);
              return (
                <div key={salle}
                  onClick={() => !loading && handleChoixSalle(salle)}
                  style={{
                    padding: "16px 20px", borderRadius: "var(--r-lg)", cursor: "pointer",
                    border: `1.5px solid ${libre ? "var(--green)" : "var(--amber)"}`,
                    background: libre ? "var(--green-bg)" : "var(--amber-bg)",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    opacity: loading ? 0.6 : 1,
                    transition: "transform 0.1s, box-shadow 0.1s",
                  }}
                  onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; } }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: libre ? "var(--green-text)" : "var(--amber-text)" }}>
                      {salle}
                    </div>
                    <div style={{ fontSize: 11, color: libre ? "var(--green)" : "var(--amber)", marginTop: 2, fontWeight: 500 }}>
                      {libre ? "Disponible sur ce créneau" : "Créneau existant — sélectionner quand même ?"}
                    </div>
                  </div>
                  <span style={{ fontSize: 20, color: libre ? "var(--green)" : "var(--amber)" }}>→</span>
                </div>
              );
            })}
          </div>

          <button onClick={reset}
            style={{
              width: "100%", padding: "10px", borderRadius: "var(--r-md)",
              border: "1px solid var(--border2)", background: "transparent",
              color: "var(--text-3)", fontSize: 13, cursor: "pointer", fontWeight: 500,
            }}>
            ← Modifier la date / heure
          </button>
        </div>
      )}

      {/* ── STEP 3: Jury & confirmer ── */}
      {step === 3 && (
        <div>
          {/* Recap */}
          <div style={{
            background: "var(--blue-50)", border: "1px solid var(--blue-200)",
            borderRadius: "var(--r-lg)", padding: "16px 20px", marginBottom: 24,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--blue-700)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
              Créneau à créer
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--blue-700)" }}>{salleChoisie}</div>
            <div style={{ fontSize: 13, color: "var(--blue-600)", marginTop: 3, fontFamily: "'JetBrains Mono', monospace" }}>
              {date} · {heureDebut} — {heureFin} · {duree} min
            </div>
          </div>

          {/* Prof selection */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>
              Sélectionner le jury
            </div>
            <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 14 }}>
              Les profs indisponibles ne peuvent pas être sélectionnés.
              {juryIds.length > 0 && (
                <span style={{ color: "var(--blue-600)", fontWeight: 700, marginLeft: 8 }}>
                  {juryIds.length} sélectionné{juryIds.length > 1 ? "s" : ""}
                </span>
              )}
            </div>

            {loading ? (
              <div style={{ fontSize: 13, color: "var(--text-4)" }}>Chargement...</div>
            ) : profsDispos.length === 0 ? (
              <div style={{
                fontSize: 13, color: "var(--text-4)", padding: "14px",
                background: "var(--surface2)", borderRadius: "var(--r-md)",
              }}>
                Aucune donnée de disponibilité pour ce jour.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {profsDispos.map(p => {
                  const isSelected = juryIds.includes(String(p.id));
                  const isIndispo  = !p.disponible;
                  return (
                    <div key={p.id}
                      onClick={() => toggleProf(p)}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "12px 16px", borderRadius: "var(--r-md)",
                        cursor: isIndispo ? "not-allowed" : "pointer",
                        border: `1.5px solid ${isIndispo ? "var(--red-bg)" : isSelected ? "var(--blue-500)" : "var(--green)"}`,
                        background: isIndispo ? "var(--red-bg)" : isSelected ? "var(--blue-50)" : "var(--green-bg)",
                        opacity: isIndispo ? 0.6 : 1,
                        transition: "all 0.15s",
                      }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: isSelected ? 700 : 500, color: isIndispo ? "var(--red-text)" : isSelected ? "var(--blue-700)" : "var(--green-text)" }}>
                          {p.nom}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--text-4)", marginTop: 1 }}>{p.departement}</div>
                      </div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                          background: isIndispo ? "var(--red)" : "var(--green)", color: "#fff",
                        }}>
                          {isIndispo ? "Indisponible" : "Disponible"}
                        </span>
                        {!isIndispo && (
                          <div style={{
                            width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                            border: `2px solid ${isSelected ? "var(--blue-600)" : "var(--border2)"}`,
                            background: isSelected ? "var(--blue-600)" : "transparent",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            {isSelected && <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>✓</span>}
                          </div>
                        )}
                        {isIndispo && (
                          <div style={{
                            width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                            background: "var(--red)", display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>✕</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Jury recap */}
          {juryIds.length > 0 && (
            <div style={{
              background: "var(--blue-50)", border: "1px solid var(--blue-200)",
              borderRadius: "var(--r-md)", padding: "10px 16px", marginBottom: 20,
            }}>
              <div style={{ fontSize: 11, color: "var(--blue-700)", fontWeight: 700, marginBottom: 4 }}>
                Jury sélectionné :
              </div>
              <div style={{ fontSize: 13, color: "var(--blue-700)" }}>
                {profsSelectionnes.map(p => p.nom).join(" · ")}
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={handleCreer}
              disabled={creating || juryIds.length === 0}
              style={{
                flex: 1, padding: "12px", borderRadius: "var(--r-md)", border: "none",
                background: juryIds.length === 0 ? "var(--surface3)" : "var(--green)",
                color: juryIds.length === 0 ? "var(--text-4)" : "#fff",
                fontSize: 14, fontWeight: 700,
                cursor: juryIds.length === 0 ? "not-allowed" : "pointer",
                opacity: creating ? 0.6 : 1,
                transition: "all 0.15s",
              }}>
              {creating ? "Création..." : juryIds.length === 0 ? "Sélectionnez au moins 1 prof" : "✓ Créer ce créneau"}
            </button>
            <button onClick={() => setStep(2)}
              style={{
                padding: "12px 20px", borderRadius: "var(--r-md)",
                border: "1px solid var(--border2)", background: "transparent",
                color: "var(--text-3)", fontSize: 13, cursor: "pointer",
              }}>
              Retour
            </button>
          </div>
        </div>
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

  const creneauxValides  = creneaux.filter(c => c.jury?.length > 0 && c.salle);
  const filteredCreneaux = creneauxValides.filter(c => {
    const salleOk  = filterSalle  === "TOUT" || c.salle  === filterSalle;
    const statutOk = filterStatut === "TOUT" || c.statut === filterStatut;
    return salleOk && statutOk;
  });

  const countDispo  = creneauxValides.filter(c => c.statut === "DISPONIBLE").length;
  const countOccupe = creneauxValides.filter(c => c.statut === "OCCUPE").length;

  const TABS = [
    { id: "creer",  label: "Créer un créneau",        icon: Calendar                             },
    { id: "dispos", label: "Disponibilités des profs", icon: Users                                },
    { id: "liste",  label: "Tous les créneaux",        icon: List, count: creneauxValides.length  },
  ];

  return (
    <div style={{ animation: "fadeUp 0.4s cubic-bezier(0.16,1,0.3,1)" }}>
      <style>{`
        input[type="date"]::-webkit-calendar-picker-indicator,
        input[type="time"]::-webkit-calendar-picker-indicator { cursor: pointer; opacity: 0.6; }
      `}</style>

      <PageHeader phase={2} title="Disponibilités & Créneaux"
        subtitle="Créez des créneaux et vérifiez la disponibilité des professeurs" />

      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Créneaux valides", value: creneauxValides.length, color: "#2563eb", bg: "#dbeafe" },
          { label: "Disponibles",      value: countDispo,             color: "#10b981", bg: "#d1fae5" },
          { label: "Occupés",          value: countOccupe,            color: "#f59e0b", bg: "#fef3c7" },
        ].map(s => (
          <div key={s.label} style={{
            background: s.bg, borderRadius: 12, padding: "14px 20px",
            display: "flex", alignItems: "center", gap: 10, flex: 1,
          }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: s.color, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</span>
          </div>
        ))}
      </div>

      <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

      {activeTab === "creer"  && <CreateurCreneau onCreated={loadCreneaux} />}
      {activeTab === "dispos" && <DisponibilitesProfs />}

      {activeTab === "liste" && (
        <div>
          <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
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
            <div style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 500 }}>
              {filteredCreneaux.length} créneau{filteredCreneaux.length !== 1 ? "x" : ""}
            </div>
          </div>

          {loadingC ? (
            <LoadingSkeleton rows={3} height={72} />
          ) : filteredCreneaux.length === 0 ? (
            <EmptyState icon={List} title="Aucun créneau" description="Aucun créneau valide trouvé." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filteredCreneaux.map(c => {
                const isOccupe = c.statut === "OCCUPE";
                const juryNoms = c.jury?.map(j => j.nom).join(" · ") || "—";
                return (
                  <div key={c.id} style={{
                    background: "var(--surface)",
                    border: `1px solid ${isOccupe ? "var(--amber)" : "var(--green)"}`,
                    borderLeft: `4px solid ${isOccupe ? "var(--amber)" : "var(--green)"}`,
                    borderRadius: "var(--r-lg)", padding: "14px 20px",
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
                    boxShadow: "var(--shadow-xs)",
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 3 }}>
                        {c.salle}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace", marginBottom: 4 }}>
                        {c.date} · {c.heureDebut} — {c.heureFin} · {c.dureeMinutes} min
                      </div>
                      <div style={{ fontSize: 11, color: "var(--blue-600)", fontWeight: 600 }}>
                        Jury : {juryNoms}
                      </div>
                    </div>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20,
                      background: isOccupe ? "var(--amber-bg)" : "var(--green-bg)",
                      color: isOccupe ? "var(--amber-text)" : "var(--green-text)",
                      border: `1px solid ${isOccupe ? "var(--amber)" : "var(--green)"}`,
                      whiteSpace: "nowrap",
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