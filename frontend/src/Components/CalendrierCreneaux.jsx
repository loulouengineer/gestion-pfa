import { useState, useEffect, useCallback, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { creneauApi } from "../api/api";

const SALLES = ["Salle A1", "Salle A2", "Salle B1", "Amphithéâtre"];

const inputStyle = {
  padding: "8px 12px", borderRadius: 8,
  border: "1px solid var(--border2)", background: "var(--surface2)",
  color: "var(--text)", outline: "none", fontSize: 13, width: "100%",
};

function creneauToEvent(creneau) {
  const isOccupe = creneau.statut === "OCCUPE";
  return {
    id:              String(creneau.id),
    title:           creneau.salle,
    start:           `${creneau.date}T${creneau.heureDebut}`,
    end:             `${creneau.date}T${creneau.heureFin}`,
    backgroundColor: isOccupe ? "#fef3c7" : "#d1fae5",
    borderColor:     isOccupe ? "#f59e0b" : "#10b981",
    textColor:       isOccupe ? "#92400e" : "#065f46",
    extendedProps:   { ...creneau },
  };
}

function ModalDetail({ creneau, onClose }) {
  if (!creneau) return null;
  const isOccupe = creneau.statut === "OCCUPE";
  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 }}>
      <div style={{
        background: "var(--surface)", borderRadius: 16,
        border: `1px solid ${isOccupe ? "#f59e0b" : "#10b981"}`,
        padding: "28px 32px", width: 380, boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>{creneau.salle}</div>
            <span style={{
              fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
              background: isOccupe ? "#fef3c7" : "#d1fae5",
              color: isOccupe ? "#92400e" : "#065f46",
              border: `1px solid ${isOccupe ? "#f59e0b" : "#10b981"}`,
            }}>
              {isOccupe ? "Occupé" : "Disponible"}
            </span>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--muted)" }}>×</button>
        </div>
        {[
          ["Date",   creneau.date],
          ["Début",  creneau.heureDebut],
          ["Fin",    creneau.heureFin],
          ["Durée",  `${creneau.dureeMinutes} min`],
        ].map(([label, val]) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
            <span style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", fontFamily: "'DM Mono', monospace" }}>{val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FormulaireCreneaux({ onCreated, selectedDate }) {
  const [form, setForm]       = useState({ date: "", heureDebut: "", dureeMinutes: "30", salle: "Salle A1" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (selectedDate) setForm(p => ({ ...p, date: selectedDate }));
  }, [selectedDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.date || !form.heureDebut) { setError("Date et heure obligatoires."); return; }
    setLoading(true); setError(null);
    try {
      await creneauApi.creer({ date: form.date, heureDebut: form.heureDebut + ":00", dureeMinutes: parseInt(form.dureeMinutes), salle: form.salle });
      setForm(p => ({ ...p, heureDebut: "" }));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      onCreated();
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border2)", borderRadius: 14, padding: "20px", position: "sticky", top: 24 }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>Nouveau créneau</div>
      <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 16 }}>Cliquez sur une date dans le calendrier pour la sélectionner</div>

      {error   && <div style={{ background: "#fee2e2", border: "1px solid #ef4444", color: "#991b1b", borderRadius: 8, padding: "8px 12px", fontSize: 12, marginBottom: 10 }}>{error}</div>}
      {success && <div style={{ background: "#d1fae5", border: "1px solid #10b981", color: "#065f46", borderRadius: 8, padding: "8px 12px", fontSize: 12, marginBottom: 10, fontWeight: 500 }}>Créneau créé.</div>}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {[
          { label: "Date",          node: <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} style={inputStyle} /> },
          { label: "Heure de début",node: <input type="time" value={form.heureDebut} onChange={e => setForm(p => ({ ...p, heureDebut: e.target.value }))} style={inputStyle} /> },
          { label: "Durée",         node: (
            <select value={form.dureeMinutes} onChange={e => setForm(p => ({ ...p, dureeMinutes: e.target.value }))} style={inputStyle}>
              <option value="20">20 min</option><option value="30">30 min</option>
              <option value="45">45 min</option><option value="60">60 min</option>
            </select>
          )},
          { label: "Salle",         node: (
            <select value={form.salle} onChange={e => setForm(p => ({ ...p, salle: e.target.value }))} style={inputStyle}>
              {SALLES.map(s => <option key={s}>{s}</option>)}
            </select>
          )},
        ].map(({ label, node }) => (
          <div key={label} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>
            {node}
          </div>
        ))}
        <button type="submit" disabled={loading} style={{ marginTop: 4, padding: "10px", borderRadius: 8, border: "none", background: "#3b82f6", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: loading ? 0.6 : 1 }}>
          {loading ? "Création..." : "Créer le créneau"}
        </button>
      </form>

      <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
        <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Légende</div>
        {[
          { bg: "#d1fae5", border: "#10b981", label: "Disponible" },
          { bg: "#fef3c7", border: "#f59e0b", label: "Occupé" },
        ].map(l => (
          <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <div style={{ width: 28, height: 14, borderRadius: 4, background: l.bg, border: `1px solid ${l.border}` }} />
            <span style={{ fontSize: 12, color: "var(--muted)" }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CalendrierCreneaux() {
  const [creneaux, setCreneaux]               = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [selectedCreneau, setSelectedCreneau] = useState(null);
  const [selectedDate, setSelectedDate]       = useState("");
  const [filterSalle, setFilterSalle]         = useState("TOUT");

  const loadCreneaux = useCallback(async () => {
    setLoading(true);
    try { setCreneaux(await creneauApi.getAll()); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadCreneaux(); }, [loadCreneaux]);

  const events = creneaux
    .filter(c => filterSalle === "TOUT" || c.salle === filterSalle)
    .map(creneauToEvent);

  const countDispo  = creneaux.filter(c => c.statut === "DISPONIBLE").length;
  const countOccupe = creneaux.filter(c => c.statut === "OCCUPE").length;

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .fc { font-family: 'DM Sans', sans-serif !important; }
        .fc-toolbar-title { font-size:16px !important; font-weight:600 !important; color:var(--text) !important; }
        .fc-button { background:var(--surface2) !important; border:1px solid var(--border2) !important; color:var(--text) !important; font-size:12px !important; font-weight:500 !important; border-radius:8px !important; padding:6px 12px !important; box-shadow:none !important; }
        .fc-button:hover { background:var(--border) !important; }
        .fc-button-primary:not(:disabled).fc-button-active { background:#3b82f6 !important; border-color:#3b82f6 !important; color:#fff !important; }
        .fc-col-header-cell { background:var(--surface2) !important; }
        .fc-col-header-cell-cushion { color:var(--muted) !important; font-size:12px !important; font-weight:500 !important; text-decoration:none !important; }
        .fc-timegrid-slot-label { color:var(--muted) !important; font-size:11px !important; font-family:'DM Mono',monospace !important; }
        .fc-daygrid-day-number { color:var(--muted) !important; font-size:12px !important; text-decoration:none !important; }
        .fc-event { border-radius:6px !important; border-width:1.5px !important; font-size:11px !important; font-weight:600 !important; cursor:pointer !important; transition: opacity 0.15s, transform 0.1s !important; }
        .fc-event:hover { opacity:0.85 !important; }
        .fc-scrollgrid, .fc-scrollgrid-section > td, .fc-timegrid-slot { border-color:var(--border) !important; }
        .fc-daygrid-day { background:var(--surface) !important; }
        .fc-day-today { background:rgba(59,130,246,0.04) !important; }
        .fc-highlight { background:rgba(59,130,246,0.08) !important; }
        .fc-toolbar { margin-bottom:16px !important; flex-wrap:wrap; gap:8px; }
        input[type="date"]::-webkit-calendar-picker-indicator,
        input[type="time"]::-webkit-calendar-picker-indicator { cursor:pointer; opacity:0.6; }
      `}</style>

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Phase 2</div>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: "var(--text)", letterSpacing: "-0.4px" }}>Calendrier des créneaux</h1>
      </div>

      {/* Stats + filtre */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, alignItems: "center", flexWrap: "wrap" }}>
        {[
          { label: "Total",       val: creneaux.length, bg: "#dbeafe", border: "#3b82f6", color: "#1e40af" },
          { label: "Disponibles", val: countDispo,       bg: "#d1fae5", border: "#10b981", color: "#065f46" },
          { label: "Occupés",     val: countOccupe,      bg: "#fef3c7", border: "#f59e0b", color: "#92400e" },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 10, padding: "10px 18px", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: s.color, letterSpacing: "-0.5px" }}>{s.val}</span>
            <span style={{ fontSize: 11, color: s.color, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>{s.label}</span>
          </div>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <label style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Salle</label>
          <select value={filterSalle} onChange={e => setFilterSalle(e.target.value)} style={{ ...inputStyle, width: "auto", padding: "7px 12px" }}>
            <option value="TOUT">Toutes</option>
            {SALLES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 270px", gap: 24, alignItems: "start" }}>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border2)", borderRadius: 14, padding: "20px" }}>
          {loading ? (
            <div style={{ height: 500, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)" }}>Chargement...</div>
          ) : (
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              headerToolbar={{ left: "prev,next today", center: "title", right: "dayGridMonth,timeGridWeek,timeGridDay" }}
              buttonText={{ today: "Aujourd'hui", month: "Mois", week: "Semaine", day: "Jour" }}
              locale="fr"
              firstDay={1}
              slotMinTime="07:00:00"
              slotMaxTime="19:00:00"
              slotDuration="00:30:00"
              allDaySlot={false}
              height={560}
              events={events}
              selectable={true}
              dateClick={(info) => setSelectedDate(info.dateStr.split("T")[0])}
              eventClick={(info) => setSelectedCreneau(info.event.extendedProps)}
              eventContent={(arg) => (
                <div style={{ padding: "2px 6px", overflow: "hidden" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{arg.event.title}</div>
                  <div style={{ fontSize: 10, opacity: 0.8 }}>{arg.timeText}</div>
                </div>
              )}
            />
          )}
        </div>
        <FormulaireCreneaux onCreated={loadCreneaux} selectedDate={selectedDate} />
      </div>

      {selectedCreneau && <ModalDetail creneau={selectedCreneau} onClose={() => setSelectedCreneau(null)} />}
    </div>
  );
}