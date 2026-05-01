import { useState, useEffect, useCallback, useRef } from "react";

import { affectationApi, soutenanceApi, creneauApi, professeurApi } from "../api/api";
import { StatBar, PageHeader, Card, Alert, EmptyState, LoadingSkeleton, Button, Badge } from "./ui";
import { Layout, Zap, Users, MapPin, Clock, Calendar, CheckCircle, X, Info, Trash2 } from "lucide-react";

// ── Modal détail créneau/soutenance ───────────────────
function ModalDetail({ data, onClose, onAnnuler, onResultat }) {
  const [saving, setSaving]   = useState(false);
  const [form, setForm]       = useState({ note: "", observations: "", present: true });
  const [notifLoading, setNotifLoading] = useState("");
  const [error, setError]     = useState(null);
  const [success, setSuccess] = useState(null);

  if (!data) return null;

  const isSoutenance = !!data.soutenance;
  const creneau      = isSoutenance ? data.soutenance.creneau : data.creneau;
  const soutenance   = isSoutenance ? data.soutenance : null;
  const jury         = creneau?.jury || [];

  const handleResultat = async () => {
    const note = parseFloat(form.note);
    if (isNaN(note) || note < 0 || note > 20) { setError("Note invalide (0–20)."); return; }
    setSaving(true); setError(null);
    try {
      await soutenanceApi.enregistrerResultat(soutenance.id, { note, observations: form.observations, present: form.present });
      setSuccess("Résultat enregistré.");
      onResultat && onResultat();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const handleNotif = async (type) => {
    setNotifLoading(type); setError(null);
    try {
      if (type === "debut") await soutenanceApi.notifierDebut(soutenance.id);
      if (type === "fin")   await soutenanceApi.notifierFin(soutenance.id, "");
      setSuccess("Notification envoyée au jury.");
    } catch (e) { setError(e.message); }
    finally { setNotifLoading(""); }
  };

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3000, padding: 20 }}>
      <div style={{
        background: "var(--surface)", borderRadius: "var(--r-xl)",
        border: "1px solid var(--border2)", boxShadow: "var(--shadow-xl)",
        width: 520, maxHeight: "90vh", overflowY: "auto",
        animation: "scaleIn 0.2s cubic-bezier(0.16,1,0.3,1)",
      }}>
        {/* Header */}
        <div style={{
          padding: "20px 24px", borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: isSoutenance ? "linear-gradient(135deg, var(--blue-50), #fff)" : "var(--surface2)",
          borderRadius: "var(--r-xl) var(--r-xl) 0 0",
        }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>
              {isSoutenance
                ? `${soutenance.binome?.etudiant1?.nom} & ${soutenance.binome?.etudiant2?.nom}`
                : `Créneau — ${creneau?.salle}`
              }
            </div>
            <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 3, display: "flex", gap: 10 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Calendar size={11} /> {creneau?.date}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Clock size={11} /> {creneau?.heureDebut} — {creneau?.heureFin}
              </span>
            </div>
          </div>
          <button onClick={onClose}
            style={{ background: "var(--surface2)", border: "1px solid var(--border2)", borderRadius: "var(--r-md)", padding: "6px 10px", cursor: "pointer", color: "var(--text-3)" }}>
            <X size={14} />
          </button>
        </div>

        <div style={{ padding: "20px 24px" }}>
          {error   && <Alert type="error"   message={error}   onClose={() => setError(null)}   />}
          {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}

          {/* Salle */}
          <InfoRow icon={MapPin}  label="Salle"    value={creneau?.salle || "—"} />
          <InfoRow icon={Clock}   label="Durée"    value={`${creneau?.dureeMinutes || "—"} min`} />

          {/* Sujet */}
          {isSoutenance && soutenance.sujet && (
            <InfoRow icon={Info} label="Sujet" value={soutenance.sujet.titre} />
          )}

          {/* Jury */}
          <div style={{ marginTop: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-4)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>
              <Users size={11} /> Jury ({jury.length})
            </div>
            {jury.length === 0 ? (
              <div style={{ fontSize: 13, color: "var(--text-4)", fontStyle: "italic" }}>Aucun jury</div>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {jury.map(j => (
                  <span key={j.id} style={{
                    padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 500,
                    background: "var(--blue-50)", color: "var(--blue-700)",
                    border: "1px solid var(--blue-200)",
                  }}>{j.nom}</span>
                ))}
              </div>
            )}
          </div>

          {/* Statut */}
          {isSoutenance && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-4)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Statut</div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Badge label={soutenance.statut} variant={
                  soutenance.statut === "TERMINEE" ? "green" :
                  soutenance.statut === "EN_COURS" ? "violet" : "blue"
                } dot />
                {soutenance.note !== null && (
                  <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-2)" }}>
                    Note : {soutenance.note?.toFixed(2)} / 20
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Enregistrer résultat */}
          {isSoutenance && soutenance.statut !== "TERMINEE" && (
            <div style={{
              background: "var(--surface2)", borderRadius: "var(--r-md)",
              border: "1px solid var(--border)", padding: "14px 16px", marginBottom: 14,
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
                Enregistrer le résultat
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "100px 1fr auto", gap: 8, alignItems: "end" }}>
                <div>
                  <div style={{ fontSize: 10, color: "var(--text-4)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Note</div>
                  <input type="number" min="0" max="20" step="0.25" placeholder="0–20"
                    value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "var(--r-md)", border: "1px solid var(--border2)", background: "var(--surface)", fontSize: 14, fontWeight: 700, textAlign: "center", outline: "none" }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "var(--text-4)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Observations</div>
                  <input placeholder="Commentaire du jury..."
                    value={form.observations} onChange={e => setForm(p => ({ ...p, observations: e.target.value }))}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "var(--r-md)", border: "1px solid var(--border2)", background: "var(--surface)", fontSize: 13, outline: "none" }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "var(--text-4)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Présence</div>
                  <select value={form.present ? "oui" : "non"} onChange={e => setForm(p => ({ ...p, present: e.target.value === "oui" }))}
                    style={{ padding: "8px 10px", borderRadius: "var(--r-md)", border: "1px solid var(--border2)", background: "var(--surface)", fontSize: 13, cursor: "pointer" }}>
                    <option value="oui">Présent</option>
                    <option value="non">Absent</option>
                  </select>
                </div>
              </div>
              <Button variant="primary" size="sm" icon={CheckCircle} onClick={handleResultat} disabled={saving} style={{ marginTop: 10 }}>
                {saving ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          )}

          {/* Notifications jury */}
          {isSoutenance && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Button variant="secondary" size="sm"
                disabled={notifLoading === "debut"}
                onClick={() => handleNotif("debut")}>
                {notifLoading === "debut" ? "..." : "Notifier — Début"}
              </Button>
              <Button variant="secondary" size="sm"
                disabled={notifLoading === "fin"}
                onClick={() => handleNotif("fin")}>
                {notifLoading === "fin" ? "..." : "Notifier — Fin"}
              </Button>
              {onAnnuler && (
                <Button variant="danger" size="sm" icon={Trash2}
                  onClick={() => onAnnuler(soutenance.id)}>
                  Annuler
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "7px 0", borderBottom: "1px solid var(--border)" }}>
      <Icon size={13} color="var(--text-4)" style={{ marginTop: 2, flexShrink: 0 }} />
      <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-4)", textTransform: "uppercase", letterSpacing: "0.06em", minWidth: 70, marginTop: 1 }}>{label}</span>
      <span style={{ fontSize: 13, color: "var(--text-2)", fontWeight: 500 }}>{value}</span>
    </div>
  );
}

// ── Carte binôme draggable ────────────────────────────
function BinomeCard({ affectation }) {
  const nom1 = affectation.binome?.etudiant1?.nom || "";
  const nom2 = affectation.binome?.etudiant2?.nom || "";

  const handleDragStart = (e) => {
    e.dataTransfer.setData("affectation", JSON.stringify(affectation));
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      style={{
        background: "var(--surface)", border: "1px solid var(--blue-200)",
        borderLeft: "4px solid var(--blue-600)", borderRadius: "var(--r-md)",
        padding: "10px 14px", marginBottom: 8, cursor: "grab",
        userSelect: "none", boxShadow: "var(--shadow-xs)",
        transition: "box-shadow 0.15s, transform 0.1s",
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "var(--shadow-blue)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "var(--shadow-xs)"; e.currentTarget.style.transform = "none"; }}
    >
      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--blue-700)", marginBottom: 2 }}>
        {nom1} <span style={{ opacity: 0.5 }}>&</span> {nom2}
      </div>
      <div style={{ fontSize: 11, color: "var(--text-4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {affectation.sujet?.titre}
      </div>
      <div style={{ fontSize: 10, color: "var(--text-4)", marginTop: 4 }}>
        ↕ Glisser vers un créneau vert
      </div>
    </div>
  );
}

// ── Calendrier CSS custom (no overlap guaranteed) ────
function CalendrierCustom({ creneaux, soutenances, onEventReceive, onEventClick, affectations }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const dragOverRef = useRef(null);

  // Get Mon–Fri of current week
  const getWeekDays = (base) => {
    const d = new Date(base);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    return Array.from({ length: 5 }, (_, i) => {
      const day = new Date(d);
      day.setDate(d.getDate() + i);
      return day;
    });
  };

  const weekDays = getWeekDays(currentDate);
  const SLOTS = ["08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30"];

  const fmtDate = (d) => d.toISOString().split("T")[0];
  const fmtDay  = (d) => d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" });
  const fmtWeek = () => {
    const opts = { day: "numeric", month: "long" };
    return `${weekDays[0].toLocaleDateString("fr-FR", opts)} — ${weekDays[4].toLocaleDateString("fr-FR", opts)}`;
  };

  const prevWeek = () => { const d = new Date(currentDate); d.setDate(d.getDate() - 7); setCurrentDate(d); };
  const nextWeek = () => { const d = new Date(currentDate); d.setDate(d.getDate() + 7); setCurrentDate(d); };
  const goToday  = () => setCurrentDate(new Date());

  // Get events for a given date+slot
  const getEvents = (dateStr, slot) => {
    const events = [];
    // Available creneaux
    creneaux.filter(c =>
      c.statut === "DISPONIBLE" && c.date === dateStr &&
      c.heureDebut.substring(0,5) === slot && c.salle
    ).forEach(c => {
      const juryNoms = (c.jury || []).map(j => j.nom.split(" ").slice(-1)[0]).join(", ");
      events.push({ type: "libre", id: c.id, title: c.salle, sub: juryNoms, creneau: c });
    });
    // Planned soutenances
    soutenances.filter(s =>
      s.creneau?.date === dateStr && s.creneau?.heureDebut?.substring(0,5) === slot
    ).forEach(s => {
      events.push({
        type: "planifiee", id: s.id,
        title: `${s.binome?.etudiant1?.nom?.split(" ").slice(-1)[0]} & ${s.binome?.etudiant2?.nom?.split(" ").slice(-1)[0]}`,
        sub: s.creneau?.salle,
        soutenance: s,
      });
    });
    return events;
  };

  // Handle drop on a slot
  const handleDrop = (e, dateStr, slot) => {
    e.preventDefault();
    dragOverRef.current = null;
    const raw = e.dataTransfer.getData("affectation");
    if (!raw) return;
    const affectation = JSON.parse(raw);

    const creneau = creneaux.find(c =>
      c.statut === "DISPONIBLE" && c.date === dateStr &&
      c.heureDebut.substring(0,5) === slot && c.salle
    );
    if (!creneau) return;
    onEventReceive({ affectation, creneau });
  };

  const handleDragOver = (e, key) => {
    e.preventDefault();
    dragOverRef.current = key;
  };

  const today = fmtDate(new Date());

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border2)", borderRadius: "var(--r-xl)", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid var(--border)", background: "var(--surface2)" }}>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={prevWeek} style={{ padding: "5px 10px", borderRadius: "var(--r-sm)", border: "1px solid var(--border2)", background: "var(--surface)", cursor: "pointer", display: "flex", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "var(--text-3)" }}>‹</span>
          </button>
          <button onClick={goToday} style={{ padding: "5px 12px", borderRadius: "var(--r-sm)", border: "1px solid var(--border2)", background: "var(--surface)", cursor: "pointer", fontSize: 12, color: "var(--text-2)", fontWeight: 600 }}>
            Aujourd'hui
          </button>
          <button onClick={nextWeek} style={{ padding: "5px 10px", borderRadius: "var(--r-sm)", border: "1px solid var(--border2)", background: "var(--surface)", cursor: "pointer", display: "flex", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "var(--text-3)" }}>›</span>
          </button>
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{fmtWeek()}</div>
        <div style={{ display: "flex", gap: 14 }}>
          {[
            { bg: "#d1fae5", border: "#10b981", label: "Disponible" },
            { bg: "#dbeafe", border: "#3b82f6", label: "Planifiée" },
          ].map(l => (
            <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: l.bg, border: `1.5px solid ${l.border}` }} />
              <span style={{ fontSize: 11, color: "var(--text-3)" }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div style={{ overflowX: "auto" }}>
        <div style={{ minWidth: 700 }}>
          {/* Day headers */}
          <div style={{ display: "grid", gridTemplateColumns: "64px repeat(5, 1fr)", borderBottom: "1px solid var(--border)" }}>
            <div style={{ borderRight: "1px solid var(--border)" }} />
            {weekDays.map((d, i) => {
              const isToday = fmtDate(d) === today;
              return (
                <div key={i} style={{
                  padding: "10px 4px", textAlign: "center",
                  borderRight: i < 4 ? "1px solid var(--border)" : "none",
                  background: isToday ? "var(--blue-50)" : "transparent",
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: isToday ? "var(--blue-600)" : "var(--text-3)", textTransform: "capitalize" }}>
                    {fmtDay(d)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Time rows */}
          {SLOTS.map((slot, si) => (
            <div key={slot} style={{
              display: "grid", gridTemplateColumns: "64px repeat(5, 1fr)",
              borderBottom: si < SLOTS.length - 1 ? "1px solid var(--border)" : "none",
              minHeight: 52,
            }}>
              {/* Time label */}
              <div style={{
                padding: "6px 8px 0 0", textAlign: "right",
                fontSize: 10, color: "var(--text-4)", fontFamily: "'JetBrains Mono', monospace",
                borderRight: "1px solid var(--border)", flexShrink: 0, paddingTop: 10,
              }}>
                {slot}
              </div>

              {/* Day cells */}
              {weekDays.map((d, di) => {
                const dateStr = fmtDate(d);
                const events  = getEvents(dateStr, slot);
                const isToday = dateStr === today;
                const dropKey = `${dateStr}-${slot}`;
                const hasDropTarget = creneaux.some(c =>
                  c.statut === "DISPONIBLE" && c.date === dateStr &&
                  c.heureDebut.substring(0,5) === slot
                );

                return (
                  <div key={di}
                    onDragOver={hasDropTarget ? (e) => handleDragOver(e, dropKey) : undefined}
                    onDrop={hasDropTarget ? (e) => handleDrop(e, dateStr, slot) : undefined}
                    onDragLeave={() => { if (dragOverRef.current === dropKey) dragOverRef.current = null; }}
                    style={{
                      padding: "3px 4px",
                      borderRight: di < 4 ? "1px solid var(--border)" : "none",
                      background: isToday ? "rgba(59,130,246,0.02)" : "transparent",
                      display: "flex", flexDirection: "column", gap: 3,
                      minHeight: 52,
                    }}>
                    {/* Stack events vertically — one per row */}
                    {events.map((ev, ei) => (
                      <div key={ei}
                        onClick={() => onEventClick(ev)}
                        style={{
                          padding: "4px 7px", borderRadius: "var(--r-sm)", cursor: "pointer",
                          background: ev.type === "libre" ? "#d1fae5" : "#dbeafe",
                          border: `1px solid ${ev.type === "libre" ? "#10b981" : "#3b82f6"}`,
                          borderLeft: `3px solid ${ev.type === "libre" ? "#10b981" : "#3b82f6"}`,
                          transition: "opacity 0.1s",
                          flexShrink: 0,
                        }}
                        onMouseEnter={e => { e.currentTarget.style.opacity = "0.85"; }}
                        onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
                      >
                        <div style={{ fontSize: 11, fontWeight: 700, color: ev.type === "libre" ? "#065f46" : "#1e40af", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {ev.title}
                        </div>
                        {ev.sub && (
                          <div style={{ fontSize: 10, color: ev.type === "libre" ? "#10b981" : "#3b82f6", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: 1 }}>
                            {ev.sub}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Composant principal ───────────────────────────────
export default function Planification() {
  const [affectations, setAffectations] = useState([]);
  const [soutenances, setSoutenances]   = useState([]);
  const [creneaux, setCreneaux]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [autoLoading, setAutoLoading]   = useState(false);
  const [error, setError]               = useState(null);
  const [success, setSuccess]           = useState(null);
  const [modalData, setModalData]       = useState(null);


  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [affs, sous, cren] = await Promise.all([
        affectationApi.getAll(),
        soutenanceApi.getAll(),
        creneauApi.getAll(),
      ]);
      setAffectations(affs);
      setSoutenances(sous);
      setCreneaux(cren.filter(c => c.salle));
      setError(null);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);



  const binomesPlanes = new Set(soutenances.map(s => s.binome?.id));
  const aplanifier    = affectations.filter(a =>
    a.statut === "VALIDEE" && !binomesPlanes.has(a.binome?.id)
  );

  // Événements calendrier
  const calendarEvents = [
    // Créneaux disponibles — verts — titre = "Salle · Prof1, Prof2"
    ...creneaux.filter(c => c.statut === "DISPONIBLE").map(c => {
      const juryNoms = c.jury?.map(j => j.nom.split(" ").slice(-1)[0]).join(", ");
      return {
        id:    `libre-${c.id}`,
        title: `${c.salle}${juryNoms ? ` · ${juryNoms}` : ""}`,
        start: `${c.date}T${c.heureDebut}`,
        end:   `${c.date}T${c.heureFin}`,
        backgroundColor: "#d1fae5", borderColor: "#10b981", textColor: "#065f46",
        extendedProps: { type: "libre", creneau: c },
      };
    }),
    // Soutenances planifiées — bleues — titre = "Étudiant1 & Étudiant2"
    ...soutenances.filter(s => s.creneau).map(s => ({
      id:    `sout-${s.id}`,
      title: `${s.binome?.etudiant1?.nom?.split(" ").slice(-1)[0]} & ${s.binome?.etudiant2?.nom?.split(" ").slice(-1)[0]}`,
      start: `${s.creneau.date}T${s.creneau.heureDebut}`,
      end:   `${s.creneau.date}T${s.creneau.heureFin}`,
      backgroundColor: "#dbeafe", borderColor: "#3b82f6", textColor: "#1e40af",
      extendedProps: { type: "planifiee", soutenance: s },
    })),
  ];

  // CSS grid drag — receives {affectation, creneau} directly
  const handleEventReceive = ({ affectation, creneau }) => {
    if (!affectation || !creneau) {
      setError("Déposez sur un créneau vert disponible.");
      setTimeout(() => setError(null), 3000);
      return;
    }
    if (binomesPlanes.has(affectation.binome?.id)) {
      setError("Ce binôme a déjà une soutenance planifiée.");
      setTimeout(() => setError(null), 3000);
      return;
    }
    soutenanceApi.planifier({ affectationId: affectation.id, creneauId: creneau.id })
      .then(() => {
        setSuccess(`Soutenance planifiée : ${affectation.binome?.etudiant1?.nom} & ${affectation.binome?.etudiant2?.nom}`);
        setTimeout(() => setSuccess(null), 4000);
        loadAll();
      })
      .catch(e => { setError(e.message); setTimeout(() => setError(null), 4000); });
  };

  // CSS grid click — receives event object directly
  const handleEventClick = (ev) => {
    if (ev.type === "libre") setModalData({ creneau: ev.creneau });
    else if (ev.type === "planifiee") setModalData({ soutenance: ev.soutenance });
  };

  const handleAnnuler = async (soutenanceId) => {
    try {
      await soutenanceApi.annuler(soutenanceId);
      setModalData(null);
      setSuccess("Soutenance annulée.");
      await loadAll();
    } catch (e) { setError(e.message); }
  };

  const handleAuto = async () => {
    setAutoLoading(true); setError(null);
    try {
      const res = await soutenanceApi.planifierAuto();
      setSuccess(`${res.length} soutenance(s) planifiée(s) automatiquement.`);
      await loadAll();
    } catch (e) { setError(e.message); }
    finally { setAutoLoading(false); }
  };

  if (loading) return <LoadingSkeleton rows={4} height={80} />;

  return (
    <div style={{ animation: "fadeUp 0.4s cubic-bezier(0.16,1,0.3,1)" }}>
      <style>{`
        .fc { font-family: 'Plus Jakarta Sans', sans-serif !important; }
        .fc-toolbar-title { font-size: 15px !important; font-weight: 700 !important; color: var(--text) !important; }
        .fc-button { background: var(--surface) !important; border: 1px solid var(--border2) !important; color: var(--text-2) !important; font-size: 12px !important; font-weight: 600 !important; border-radius: var(--r-sm) !important; padding: 5px 10px !important; box-shadow: var(--shadow-xs) !important; font-family: 'Plus Jakarta Sans', sans-serif !important; }
        .fc-button:hover { background: var(--surface2) !important; }
        .fc-button-primary:not(:disabled).fc-button-active { background: var(--blue-600) !important; border-color: var(--blue-600) !important; color: #fff !important; }
        .fc-col-header-cell { background: var(--surface2) !important; }
        .fc-col-header-cell-cushion { color: var(--text-3) !important; font-size: 11px !important; font-weight: 600 !important; text-decoration: none !important; padding: 6px 4px !important; }
        .fc-timegrid-slot-label { color: var(--text-4) !important; font-size: 10px !important; font-family: 'JetBrains Mono', monospace !important; }
        .fc-event { border-radius: var(--r-sm) !important; font-size: 11px !important; font-weight: 600 !important; cursor: pointer !important; box-shadow: var(--shadow-xs) !important; }
        .fc-event:hover { opacity: 0.9 !important; box-shadow: var(--shadow-md) !important; }
        .fc-timegrid-event .fc-event-main { padding: 3px 6px !important; }
        .fc-scrollgrid, .fc-scrollgrid-section > td, .fc-timegrid-slot { border-color: var(--border) !important; }
        .fc-daygrid-day, .fc-timegrid-col { background: var(--surface) !important; }
        .fc-day-today { background: var(--blue-50) !important; }
        .fc-event-mirror { opacity: 0.7 !important; box-shadow: var(--shadow-blue) !important; }
        .fc-toolbar { margin-bottom: 14px !important; }
        .fc-timegrid-slot { min-height: 56px !important; }
        .fc-timegrid-event { min-height: 52px !important; }
        .fc-timegrid-event-harness { margin-right: 0 !important; }
        .fc-timegrid-col-events { margin: 0 2px !important; }
        .draggable-binome:active { cursor: grabbing !important; }
        @keyframes scaleIn { from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)} }
      `}</style>

      <PageHeader phase={3}
        title="Planification des soutenances"
        subtitle="Glissez les binômes vers les créneaux disponibles. Cliquez sur un créneau pour voir les détails."
        action={aplanifier.length > 0 && (
          <Button variant="violet" icon={Zap} onClick={handleAuto} disabled={autoLoading}>
            {autoLoading ? "En cours..." : `Planification auto (${aplanifier.length})`}
          </Button>
        )}
      />

      <StatBar stats={[
        { label: "À planifier",     value: aplanifier.length,                                                   color: "var(--amber)"    },
        { label: "Planifiées",      value: soutenances.length, total: aplanifier.length + soutenances.length,  color: "var(--blue-600)" },
        { label: "Créneaux libres", value: creneaux.filter(c => c.statut === "DISPONIBLE").length,              color: "var(--green)"    },
      ]} />

      {error   && <Alert type="error"   message={error}   onClose={() => setError(null)}   />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}

      <Alert type="info" message="Vert = créneau disponible (déposez un binôme). Bleu = soutenance planifiée. Cliquez pour voir les détails." />

      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 20, alignItems: "start" }}>

        {/* Colonne gauche */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-2)", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>À planifier</span>
            <Badge label={String(aplanifier.length)} variant="amber" />
          </div>

          {aplanifier.length === 0 ? (
            <EmptyState icon={CheckCircle} title="Tous planifiés" description="Tous les binômes ont une soutenance." />
          ) : (
            <div>
              {aplanifier.map(a => <BinomeCard key={a.id} affectation={a} />)}
            </div>
          )}

          {soutenances.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-2)", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Planifiées</span>
                <Badge label={String(soutenances.length)} variant="blue" />
              </div>
              {soutenances.map(s => (
                <div key={s.id}
                  onClick={() => setModalData({ soutenance: s })}
                  style={{
                    background: "var(--surface)", border: "1px solid var(--blue-200)",
                    borderLeft: "3px solid var(--blue-500)", borderRadius: "var(--r-md)",
                    padding: "9px 12px", marginBottom: 6, cursor: "pointer",
                    boxShadow: "var(--shadow-xs)",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = "var(--shadow-md)"; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = "var(--shadow-xs)"; }}
                >
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--blue-700)" }}>
                    {s.binome?.etudiant1?.nom?.split(" ").slice(-1)[0]} & {s.binome?.etudiant2?.nom?.split(" ").slice(-1)[0]}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--text-4)", marginTop: 2 }}>
                    {s.creneau?.date} · {s.creneau?.heureDebut} · {s.creneau?.salle}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Calendrier */}
        <CalendrierCustom
          creneaux={creneaux}
          soutenances={soutenances}
          onEventReceive={handleEventReceive}
          onEventClick={handleEventClick}
          affectations={affectations}
        />
      </div>

      {/* Modal détail */}
      {modalData && (
        <ModalDetail
          data={modalData}
          onClose={() => setModalData(null)}
          onAnnuler={handleAnnuler}
          onResultat={loadAll}
        />
      )}
    </div>
  );
}