import { useState, useEffect } from "react";
import { professeurApi, creneauApi } from "../api/api";
import { ChevronLeft, ChevronRight, User } from "lucide-react";

const HOURS = ["08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30"];

function getWeekDates(baseDate) {
  const start = new Date(baseDate);
  const day   = start.getDay(); // 0=Sun
  const diff  = day === 0 ? -6 : 1 - day; // Monday
  start.setDate(start.getDate() + diff);
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

function formatDate(d) {
  return d.toISOString().split("T")[0];
}

function formatDay(d) {
  return d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" });
}

function formatWeekLabel(dates) {
  const opts = { day: "numeric", month: "long" };
  return `${dates[0].toLocaleDateString("fr-FR", opts)} — ${dates[4].toLocaleDateString("fr-FR", opts)}`;
}

function parseTime(str) {
  const [h, m] = str.split(":").map(Number);
  return h * 60 + m;
}

function slotInRange(slot, heureDebut, heureFin) {
  const s = parseTime(slot);
  const b = parseTime(heureDebut.substring(0, 5));
  const e = parseTime(heureFin.substring(0, 5));
  return s >= b && s < e;
}

export default function DisponibilitesProfs() {
  const [profs, setProfs]         = useState([]);
  const [creneaux, setCreneaux]   = useState([]);
  const [selectedProf, setSelectedProf] = useState(null);
  const [dispos, setDispos]       = useState([]);
  const [baseDate, setBaseDate]   = useState(new Date());
  const [loading, setLoading]     = useState(true);
  const [loadingDispos, setLoadingDispos] = useState(false);

  useEffect(() => {
    Promise.all([professeurApi.getAll(), creneauApi.getAll()])
      .then(([ps, cs]) => {
        setProfs(ps);
        setCreneaux(cs);
        if (ps.length > 0) setSelectedProf(ps[0]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedProf) return;
    setLoadingDispos(true);
    // Charger les disponibilités du prof via checkDisponibilite pour chaque jour de la semaine
    const weekDates = getWeekDates(baseDate);
    Promise.all(weekDates.map(d =>
      professeurApi.checkDisponibilite(selectedProf.id, formatDate(d))
        .then(res => ({ date: formatDate(d), plages: res.plages || [], disponible: res.disponible }))
        .catch(() => ({ date: formatDate(d), plages: [], disponible: false }))
    )).then(results => {
      setDispos(results);
      setLoadingDispos(false);
    });
  }, [selectedProf, baseDate]);

  const weekDates = getWeekDates(baseDate);

  // Pour un slot donné, retourner son état
  const getSlotState = (dateStr, slot) => {
    const dayDispos = dispos.find(d => d.date === dateStr);
    if (!dayDispos) return "unknown";

    // Vérifier si ce slot est occupé par un créneau
    const occupied = creneaux.find(c =>
      c.date === dateStr &&
      c.jury?.length > 0 &&
      slotInRange(slot, c.heureDebut, c.heureFin)
    );
    if (occupied) return "occupied";

    // Vérifier si dispo
    const isDispo = dayDispos.plages.some(p =>
      slotInRange(slot, p.heureDebut, p.heureFin)
    );
    if (isDispo) return "available";

    return "unavailable";
  };

  const STATE_CONFIG = {
    available:   { bg: "#d1fae5", border: "#10b981", color: "#065f46", label: "Disponible" },
    occupied:    { bg: "#fee2e2", border: "#ef4444", color: "#991b1b", label: "Créneau" },
    unavailable: { bg: "var(--surface3)", border: "var(--border2)", color: "var(--text-4)", label: "" },
    unknown:     { bg: "var(--surface2)", border: "var(--border)", color: "var(--text-4)", label: "" },
  };

  const prevWeek = () => { const d = new Date(baseDate); d.setDate(d.getDate() - 7); setBaseDate(d); };
  const nextWeek = () => { const d = new Date(baseDate); d.setDate(d.getDate() + 7); setBaseDate(d); };

  if (loading) return (
    <div style={{ padding: "32px 0", textAlign: "center", color: "var(--text-4)" }}>Chargement...</div>
  );

  return (
    <div>
      {/* Sélection prof */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {profs.map(p => (
          <button key={p.id}
            onClick={() => setSelectedProf(p)}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "8px 14px", borderRadius: "var(--r-lg)",
              border: `1.5px solid ${selectedProf?.id === p.id ? "var(--blue-500)" : "var(--border2)"}`,
              background: selectedProf?.id === p.id ? "var(--blue-50)" : "var(--surface)",
              cursor: "pointer", transition: "all 0.15s",
              boxShadow: selectedProf?.id === p.id ? "0 0 0 3px rgba(59,130,246,0.1)" : "none",
            }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              background: selectedProf?.id === p.id ? "var(--blue-100)" : "var(--surface3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700,
              color: selectedProf?.id === p.id ? "var(--blue-700)" : "var(--text-3)",
              flexShrink: 0,
            }}>
              {p.nom.charAt(0)}
            </div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: selectedProf?.id === p.id ? "var(--blue-700)" : "var(--text-2)" }}>
                {p.nom}
              </div>
              <div style={{ fontSize: 10, color: "var(--text-4)" }}>{p.departement}</div>
            </div>
          </button>
        ))}
      </div>

      {selectedProf && (
        <div style={{
          background: "var(--surface)", borderRadius: "var(--r-xl)",
          border: "1px solid var(--border2)", overflow: "hidden",
          boxShadow: "var(--shadow-sm)",
        }}>
          {/* Calendar header */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 20px", borderBottom: "1px solid var(--border)",
            background: "var(--surface2)",
          }}>
            <button onClick={prevWeek}
              style={{ background: "var(--surface)", border: "1px solid var(--border2)", borderRadius: "var(--r-md)", padding: "6px 10px", cursor: "pointer", display: "flex", alignItems: "center" }}>
              <ChevronLeft size={14} color="var(--text-3)" />
            </button>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>
                {formatWeekLabel(weekDates)}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-4)", marginTop: 2 }}>
                Fuseau : Africa/Tunis (GMT +1:00)
              </div>
            </div>
            <button onClick={nextWeek}
              style={{ background: "var(--surface)", border: "1px solid var(--border2)", borderRadius: "var(--r-md)", padding: "6px 10px", cursor: "pointer", display: "flex", alignItems: "center" }}>
              <ChevronRight size={14} color="var(--text-3)" />
            </button>
          </div>

          {/* Day headers */}
          <div style={{ display: "grid", gridTemplateColumns: "70px repeat(5, 1fr)", borderBottom: "1px solid var(--border)" }}>
            <div style={{ padding: "10px 0", borderRight: "1px solid var(--border)" }} />
            {weekDates.map((d, i) => {
              const today = formatDate(new Date()) === formatDate(d);
              return (
                <div key={i} style={{
                  padding: "10px 8px", textAlign: "center",
                  borderRight: i < 4 ? "1px solid var(--border)" : "none",
                  background: today ? "var(--blue-50)" : "transparent",
                }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: today ? "var(--blue-600)" : "var(--text-3)", textTransform: "capitalize" }}>
                    {formatDay(d)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Time grid */}
          {loadingDispos ? (
            <div style={{ padding: "32px", textAlign: "center", color: "var(--text-4)", fontSize: 13 }}>
              Chargement des disponibilités...
            </div>
          ) : (
            <div style={{ overflow: "auto" }}>
              {HOURS.map((slot, si) => (
                <div key={slot} style={{
                  display: "grid",
                  gridTemplateColumns: "70px repeat(5, 1fr)",
                  borderBottom: si < HOURS.length - 1 ? "1px solid var(--border)" : "none",
                  minHeight: 44,
                }}>
                  {/* Time label */}
                  <div style={{
                    padding: "12px 10px 0 0", textAlign: "right",
                    fontSize: 11, color: "var(--text-4)", fontFamily: "'JetBrains Mono', monospace",
                    borderRight: "1px solid var(--border)", flexShrink: 0,
                  }}>
                    {slot}
                  </div>

                  {/* Slots per day */}
                  {weekDates.map((d, di) => {
                    const dateStr = formatDate(d);
                    const state   = getSlotState(dateStr, slot);
                    const cfg     = STATE_CONFIG[state];
                    const today   = formatDate(new Date()) === dateStr;

                    return (
                      <div key={di} style={{
                        padding: "4px 6px",
                        borderRight: di < 4 ? "1px solid var(--border)" : "none",
                        background: today ? "rgba(59,130,246,0.02)" : "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {state !== "unknown" && (
                          <div style={{
                            width: "100%", padding: "5px 8px",
                            borderRadius: "var(--r-sm)",
                            background: cfg.bg,
                            border: `1px solid ${cfg.border}`,
                            fontSize: 11, fontWeight: 600, color: cfg.color,
                            textAlign: "center", cursor: state === "available" ? "default" : "default",
                            transition: "opacity 0.1s",
                          }}>
                            {state === "available" && slot}
                            {state === "occupied" && "Créneau"}
                            {state === "unavailable" && ""}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}

          {/* Legend */}
          <div style={{
            display: "flex", gap: 16, padding: "12px 20px",
            borderTop: "1px solid var(--border)", background: "var(--surface2)",
            flexWrap: "wrap",
          }}>
            {[
              { bg: "#d1fae5", border: "#10b981", label: "Disponible" },
              { bg: "#fee2e2", border: "#ef4444", label: "Créneau planifié" },
              { bg: "var(--surface3)", border: "var(--border2)", label: "Indisponible" },
            ].map(l => (
              <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: l.bg, border: `1px solid ${l.border}` }} />
                <span style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 500 }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}