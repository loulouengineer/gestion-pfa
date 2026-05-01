import { useState, useEffect, useCallback } from "react";
import { disponibiliteApi } from "../api/api";
import { PageHeader, Alert, Button, LoadingSkeleton } from "./ui";
import { ChevronLeft, ChevronRight, Plus, Trash2, Lock } from "lucide-react";

const SLOTS = [
  "08:00","08:30","09:00","09:30","10:00","10:30",
  "11:00","11:30","12:00","12:30","13:00","13:30",
  "14:00","14:30","15:00","15:30","16:00","16:30",
];

function getWeekDays(base) {
  const d    = new Date(base);
  const day  = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return Array.from({ length: 5 }, (_, i) => {
    const day = new Date(d);
    day.setDate(d.getDate() + i);
    return day;
  });
}

function fmtDate(d) { return d.toISOString().split("T")[0]; }
function fmtDay(d) {
  return d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });
}
function fmtWeek(days) {
  const opts = { day: "numeric", month: "long" };
  return `${days[0].toLocaleDateString("fr-FR", opts)} — ${days[4].toLocaleDateString("fr-FR", opts)}`;
}
function parseMin(t) { const [h, m] = t.split(":").map(Number); return h * 60 + m; }

// A day is locked for editing when it's within 12 hours of midnight that day
function isDateLocked(dateStr) {
  const dayStart = new Date(dateStr + "T00:00:00");
  return (dayStart.getTime() - Date.now()) < 12 * 60 * 60 * 1000;
}

// Check if a slot falls within a dispo range
function slotInDispo(slot, dispo) {
  const s = parseMin(slot);
  const b = parseMin(dispo.heureDebut.substring(0, 5));
  const e = parseMin(dispo.heureFin.substring(0, 5));
  return s >= b && s < e;
}

export default function ProfDisponibilites({ prof }) {
  const [baseDate, setBaseDate]     = useState(new Date());
  const [dispos, setDispos]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [success, setSuccess]       = useState(null);
  const [selecting, setSelecting]   = useState(null); // { dateStr, slot }
  const [showForm, setShowForm]     = useState(false);
  const [form, setForm]             = useState({ heureDebut: "", heureFin: "" });
  const [saving, setSaving]         = useState(false);

  const weekDays = getWeekDays(baseDate);
  const today    = fmtDate(new Date());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await disponibiliteApi.getByProf(prof.id);
      setDispos(data);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [prof.id]);

  useEffect(() => { load(); }, [load]);

  // Get dispo for a given date+slot
  const getDispoForSlot = (dateStr, slot) => {
    return dispos.find(d => d.date === dateStr && d.disponible && slotInDispo(slot, d));
  };

  // Quick add: click on a slot to toggle
  const handleSlotClick = async (dateStr, slot) => {
    if (isDateLocked(dateStr)) {
      setError("Modification impossible : le délai de 12h avant cette journée est dépassé.");
      setTimeout(() => setError(null), 4000);
      return;
    }
    const existing = getDispoForSlot(dateStr, slot);
    if (existing) {
      // Remove this dispo
      try {
        await disponibiliteApi.supprimer(existing.id);
        setDispos(p => p.filter(d => d.id !== existing.id));
        setSuccess("Disponibilité supprimée.");
        setTimeout(() => setSuccess(null), 2000);
      } catch (e) { setError(e.message); }
      return;
    }

    // Add a 30-min slot
    const [h, m] = slot.split(":").map(Number);
    const end = `${String(h + (m === 30 ? 1 : 0)).padStart(2, "0")}:${m === 30 ? "00" : "30"}`;

    setSaving(true);
    try {
      const newDispo = await disponibiliteApi.ajouter({
        professeurId: prof.id,
        date:         dateStr,
        heureDebut:   slot + ":00",
        heureFin:     end + ":00",
        disponible:   true,
      });
      setDispos(p => [...p, newDispo]);
      setSuccess("Disponibilité ajoutée.");
      setTimeout(() => setSuccess(null), 2000);
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  // Add custom range
  const handleAddRange = async () => {
    if (!selecting || !form.heureDebut || !form.heureFin) { setError("Remplissez les heures."); return; }
    if (isDateLocked(selecting.dateStr)) { setError("Modification impossible : le délai de 12h avant cette journée est dépassé."); return; }
    if (parseMin(form.heureDebut) >= parseMin(form.heureFin)) { setError("L'heure de fin doit être après le début."); return; }
    setSaving(true); setError(null);
    try {
      const newDispo = await disponibiliteApi.ajouter({
        professeurId: prof.id,
        date:         selecting.dateStr,
        heureDebut:   form.heureDebut + ":00",
        heureFin:     form.heureFin + ":00",
        disponible:   true,
      });
      setDispos(p => [...p, newDispo]);
      setShowForm(false);
      setSelecting(null);
      setForm({ heureDebut: "", heureFin: "" });
      setSuccess("Plage ajoutée.");
      setTimeout(() => setSuccess(null), 2000);
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  // Get all dispos for a given date
  const getDisposForDate = (dateStr) =>
    dispos.filter(d => d.date === dateStr && d.disponible);

  const prevWeek = () => { const d = new Date(baseDate); d.setDate(d.getDate() - 7); setBaseDate(d); };
  const nextWeek = () => { const d = new Date(baseDate); d.setDate(d.getDate() + 7); setBaseDate(d); };

  return (
    <div style={{ animation: "fadeUp 0.4s cubic-bezier(0.16,1,0.3,1)" }}>
      <PageHeader phase="📅" title="Mes disponibilités"
        subtitle="Cliquez sur un créneau pour l'ajouter ou le supprimer. Vert = disponible."
      />

      {error   && <Alert type="error"   message={error}   onClose={() => setError(null)}   />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}

      {/* Instructions */}
      <div style={{
        background: "var(--blue-50)", border: "1px solid var(--blue-200)",
        borderRadius: "var(--r-md)", padding: "10px 16px",
        fontSize: 12, color: "var(--blue-700)", marginBottom: 20,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span>Cliquez sur un créneau pour basculer votre disponibilité. Cliquez sur une colonne pour ajouter une plage personnalisée.</span>
      </div>

      <div style={{
        background: "var(--surface)", borderRadius: "var(--r-xl)",
        border: "1px solid var(--border2)", boxShadow: "var(--shadow-sm)",
        overflow: "hidden",
      }}>
        {/* Toolbar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 20px", borderBottom: "1px solid var(--border)",
          background: "var(--surface2)",
        }}>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={prevWeek} style={{ padding: "6px 12px", borderRadius: "var(--r-sm)", border: "1px solid var(--border2)", background: "var(--surface)", cursor: "pointer", fontSize: 13, color: "var(--text-3)" }}>‹</button>
            <button onClick={() => setBaseDate(new Date())} style={{ padding: "6px 12px", borderRadius: "var(--r-sm)", border: "1px solid var(--border2)", background: "var(--surface)", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "var(--text-2)" }}>Aujourd'hui</button>
            <button onClick={nextWeek} style={{ padding: "6px 12px", borderRadius: "var(--r-sm)", border: "1px solid var(--border2)", background: "var(--surface)", cursor: "pointer", fontSize: 13, color: "var(--text-3)" }}>›</button>
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{fmtWeek(weekDays)}</div>
          <div style={{ display: "flex", gap: 12 }}>
            {[{ bg: "#d1fae5", border: "#10b981", label: "Disponible" }, { bg: "var(--surface3)", border: "var(--border2)", label: "Indisponible" }].map(l => (
              <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: l.bg, border: `1px solid ${l.border}` }} />
                <span style={{ fontSize: 11, color: "var(--text-3)" }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 20 }}><LoadingSkeleton rows={4} height={44} /></div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <div style={{ minWidth: 700 }}>
              {/* Day headers */}
              <div style={{ display: "grid", gridTemplateColumns: "64px repeat(5, 1fr)", borderBottom: "1px solid var(--border)" }}>
                <div style={{ borderRight: "1px solid var(--border)" }} />
                {weekDays.map((d, i) => {
                  const dateStr = fmtDate(d);
                  const isToday = dateStr === today;
                  const locked  = isDateLocked(dateStr);
                  const dayDispos = getDisposForDate(dateStr);
                  return (
                    <div key={i} style={{
                      padding: "10px 8px", textAlign: "center",
                      borderRight: i < 4 ? "1px solid var(--border)" : "none",
                      background: isToday ? "var(--blue-50)" : locked ? "rgba(239,68,68,0.02)" : "transparent",
                    }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: isToday ? "var(--blue-600)" : locked ? "#ef4444" : "var(--text-3)", textTransform: "capitalize", marginBottom: 4, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                        {locked && <Lock size={8} />}
                        {fmtDay(d)}
                      </div>
                      {locked ? (
                        <div style={{ fontSize: 9, color: "#ef4444", fontWeight: 600, padding: "2px 4px" }}>
                          Verrouillé
                        </div>
                      ) : (
                        <button
                          onClick={() => { setSelecting({ dateStr }); setShowForm(true); }}
                          style={{
                            fontSize: 10, color: "var(--blue-600)", background: "var(--blue-50)",
                            border: "1px solid var(--blue-200)", borderRadius: 6,
                            padding: "2px 8px", cursor: "pointer", fontWeight: 600,
                            display: "flex", alignItems: "center", gap: 3, margin: "0 auto",
                          }}>
                          <Plus size={9} /> Plage
                        </button>
                      )}
                      {dayDispos.length > 0 && (
                        <div style={{ fontSize: 9, color: "var(--green-text)", marginTop: 3, fontWeight: 600 }}>
                          {dayDispos.length} plage{dayDispos.length > 1 ? "s" : ""}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Slots */}
              {SLOTS.map((slot, si) => (
                <div key={slot} style={{
                  display: "grid", gridTemplateColumns: "64px repeat(5, 1fr)",
                  borderBottom: si < SLOTS.length - 1 ? "1px solid var(--border)" : "none",
                  minHeight: 46,
                }}>
                  <div style={{
                    padding: "0 8px 0 0", textAlign: "right", paddingTop: 14,
                    fontSize: 10, color: "var(--text-4)", fontFamily: "'JetBrains Mono', monospace",
                    borderRight: "1px solid var(--border)",
                  }}>
                    {slot}
                  </div>
                  {weekDays.map((d, di) => {
                    const dateStr = fmtDate(d);
                    const dispo   = getDispoForSlot(dateStr, slot);
                    const isToday = dateStr === today;
                    const isPast  = new Date(`${dateStr}T${slot}`) < new Date();
                    const locked  = isDateLocked(dateStr);
                    const blocked = isPast || locked;
                    return (
                      <div key={di}
                        onClick={() => !blocked && handleSlotClick(dateStr, slot)}
                        style={{
                          padding: "4px 6px",
                          borderRight: di < 4 ? "1px solid var(--border)" : "none",
                          background: isToday ? "rgba(59,130,246,0.02)" : locked ? "rgba(239,68,68,0.01)" : "transparent",
                          cursor: blocked ? "default" : "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          minHeight: 46,
                        }}>
                        <div style={{
                          width: "100%", height: 36, borderRadius: "var(--r-sm)",
                          background: dispo ? "#d1fae5" : isPast ? "transparent" : "transparent",
                          border: dispo ? "1px solid #10b981" : "none",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          transition: "all 0.15s",
                          fontSize: 11, fontWeight: 600,
                          color: dispo ? "#065f46" : "transparent",
                        }}
                          onMouseEnter={e => { if (!dispo && !blocked) { e.currentTarget.style.background = "rgba(16,185,129,0.08)"; e.currentTarget.style.border = "1px dashed #10b981"; } }}
                          onMouseLeave={e => { if (!dispo && !blocked) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.border = "none"; } }}
                        >
                          {dispo ? slot : ""}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Form modal for custom range */}
      {showForm && selecting && (
        <div onClick={e => { if (e.target === e.currentTarget) { setShowForm(false); setSelecting(null); } }}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 }}>
          <div style={{
            background: "var(--surface)", borderRadius: "var(--r-xl)",
            border: "1px solid var(--border2)", padding: "24px 28px", width: 360,
            boxShadow: "var(--shadow-xl)", animation: "scaleIn 0.2s cubic-bezier(0.16,1,0.3,1)",
          }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>Ajouter une plage</div>
            <div style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 18 }}>
              {selecting.dateStr}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              {[["heureDebut", "Début"], ["heureFin", "Fin"]].map(([key, label]) => (
                <div key={key}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-4)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>{label}</div>
                  <input type="time" value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                    style={{ width: "100%", padding: "9px 10px", borderRadius: "var(--r-md)", border: "1px solid var(--border2)", background: "var(--surface)", fontSize: 13, outline: "none", boxSizing: "border-box" }}
                  />
                </div>
              ))}
            </div>
            {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
            <div style={{ display: "flex", gap: 10 }}>
              <Button variant="success" onClick={handleAddRange} disabled={saving} style={{ flex: 1 }}>
                {saving ? "Ajout..." : "Ajouter"}
              </Button>
              <Button variant="ghost" onClick={() => { setShowForm(false); setSelecting(null); }}>
                Annuler
              </Button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes scaleIn{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}`}</style>
    </div>
  );
}