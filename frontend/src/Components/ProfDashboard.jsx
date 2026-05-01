import { useState, useEffect } from "react";
import { sujetApi, soutenanceApi } from "../api/api";
import { BookOpen, Clock, CheckCircle, XCircle, Calendar, MapPin, Users } from "lucide-react";

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div style={{
      background: `${color}10`, border: `1px solid ${color}30`,
      borderRadius: 14, padding: "18px 22px", display: "flex", alignItems: "center", gap: 16,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: `${color}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <Icon size={20} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>{label}</div>
      </div>
    </div>
  );
}

function SoutenanceRow({ s }) {
  const date  = s.creneau?.date || "—";
  const heure = s.creneau?.heureDebut?.slice(0, 5) || "";
  const salle = s.creneau?.salle || "—";
  const et1   = s.binome?.etudiant1?.nom || "";
  const et2   = s.binome?.etudiant2?.nom || "";

  const statusColor = { PLANIFIEE: "#3b82f6", EN_COURS: "#8b5cf6", TERMINEE: "#10b981", ANNULEE: "#ef4444" };
  const color = statusColor[s.statut] || "#64748b";

  return (
    <div style={{
      background: "var(--surface, #1e293b)", border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 12, padding: "14px 18px", marginBottom: 8,
      display: "flex", alignItems: "center", gap: 16,
    }}>
      <div style={{
        width: 8, height: 40, borderRadius: 4, background: color, flexShrink: 0,
      }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>
          {et1} <span style={{ color: "#475569" }}>&</span> {et2}
        </div>
        <div style={{ fontSize: 11, color: "#64748b", marginTop: 3, display: "flex", gap: 14 }}>
          <span><Calendar size={10} style={{ marginRight: 4 }} />{date} {heure}</span>
          <span><MapPin size={10} style={{ marginRight: 4 }} />{salle}</span>
        </div>
      </div>
      <span style={{
        fontSize: 10, padding: "3px 10px", borderRadius: 20, fontWeight: 600,
        background: `${color}20`, color,
      }}>{s.statut}</span>
    </div>
  );
}

export default function ProfDashboard({ prof, onNavigate }) {
  const [sujets, setSujets]         = useState([]);
  const [soutenances, setSoutenances] = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    const profId = prof?.id;
    Promise.all([
      sujetApi.getMesSujets().then(r => r.data).catch(() => []),
      profId ? soutenanceApi.getByProf(profId).catch(() => []) : Promise.resolve([]),
    ]).then(([s, sout]) => {
      setSujets(Array.isArray(s) ? s : []);
      setSoutenances(Array.isArray(sout) ? sout : []);
      setLoading(false);
    });
  }, [prof?.id]);

  const byStatut = (st) => sujets.filter(s => s.statut === st).length;
  const upcoming = soutenances.filter(s => s.statut === "PLANIFIEE").slice(0, 3);
  const past     = soutenances.filter(s => s.statut === "TERMINEE").length;

  const now = new Date();
  const nextSoutenance = soutenances
    .filter(s => s.statut === "PLANIFIEE" && s.creneau?.date)
    .sort((a, b) => new Date(a.creneau.date) - new Date(b.creneau.date))[0];

  return (
    <div>
      {/* Welcome */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#e2e8f0", marginBottom: 4 }}>
          Bonjour, {prof?.nom} 👋
        </h1>
        <p style={{ fontSize: 13, color: "#64748b" }}>
          Voici un résumé de votre activité sur la plateforme.
        </p>
      </div>

      {/* Next soutenance alert */}
      {nextSoutenance && (
        <div style={{
          background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.3)",
          borderRadius: 12, padding: "14px 18px", marginBottom: 24,
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <Clock size={18} color="#3b82f6" />
          <span style={{ fontSize: 13, color: "#93c5fd" }}>
            <b>Prochaine soutenance</b> — {nextSoutenance.creneau.date} à {nextSoutenance.creneau.heureDebut?.slice(0,5)},
            {" "}{nextSoutenance.creneau.salle}
          </span>
        </div>
      )}

      {/* Stat cards */}
      {loading ? (
        <div style={{ color: "#64748b" }}>Chargement…</div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 32 }}>
            <StatCard icon={BookOpen}     label="Sujets proposés"    value={sujets.length}         color="#6366f1" />
            <StatCard icon={Clock}        label="En attente"          value={byStatut("EN_ATTENTE")} color="#f59e0b" />
            <StatCard icon={CheckCircle}  label="Approuvés"           value={byStatut("APPROUVE")}  color="#10b981" />
            <StatCard icon={XCircle}      label="Refusés"             value={byStatut("REFUSE")}    color="#ef4444" />
            <StatCard icon={Users}        label="Soutenances jury"    value={soutenances.length}    color="#8b5cf6" />
            <StatCard icon={CheckCircle}  label="Soutenances terminées"value={past}                 color="#10b981" />
          </div>

          {/* Upcoming soutenances */}
          {upcoming.length > 0 && (
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0", marginBottom: 12 }}>
                Soutenances à venir
              </h2>
              {upcoming.map(s => <SoutenanceRow key={s.id} s={s} />)}
              {soutenances.filter(s => s.statut === "PLANIFIEE").length > 3 && (
                <button
                  onClick={() => onNavigate?.("soutenances")}
                  style={{ marginTop: 8, fontSize: 12, color: "#6366f1", background: "none", border: "none", cursor: "pointer" }}
                >
                  Voir toutes les soutenances →
                </button>
              )}
            </div>
          )}

          {upcoming.length === 0 && soutenances.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#475569", fontSize: 13 }}>
              Aucune soutenance planifiée pour le moment.
            </div>
          )}
        </>
      )}
    </div>
  );
}
