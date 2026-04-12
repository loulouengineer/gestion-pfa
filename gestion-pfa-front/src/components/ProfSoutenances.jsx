import { useState, useEffect, useCallback } from "react";
import { soutenanceApi } from "../api/api";
import { Card, StatBar, PageHeader, LoadingSkeleton, EmptyState, Alert, Button, Badge } from "./ui";
import { Calendar, Clock, MapPin, Users, Star, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";

function SoutenanceCard({ soutenance, onResultat }) {
  const [open, setOpen]     = useState(false);
  const [form, setForm]     = useState({ note: "", observations: "", present: "true" });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState(null);
  const [success, setSuccess] = useState(false);

  const isTerminee = soutenance.statut === "TERMINEE";
  const creneau    = soutenance.creneau;
  const jury       = creneau?.jury || [];

  const isPast = creneau?.date && new Date(`${creneau.date}T${creneau.heureFin}`) < new Date();

  const noteColor = isTerminee && soutenance.note !== null
    ? soutenance.note >= 16 ? "#10b981"
    : soutenance.note >= 12 ? "#3b82f6"
    : soutenance.note >= 10 ? "#f59e0b" : "#ef4444"
    : "var(--text-4)";

  const handleSave = async () => {
    const note = parseFloat(form.note);
    if (isNaN(note) || note < 0 || note > 20) { setError("Note invalide (0–20)."); return; }
    setSaving(true); setError(null);
    try {
      await soutenanceApi.enregistrerResultat(soutenance.id, {
        note,
        observations: form.observations,
        present: form.present === "true",
      });
      setSuccess(true);
      onResultat();
      setTimeout(() => setOpen(false), 1000);
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const statusConfig = {
    PLANIFIEE: { label: "Planifiée",  variant: "blue"   },
    EN_COURS:  { label: "En cours",   variant: "violet" },
    TERMINEE:  { label: "Terminée",   variant: "green"  },
    ANNULEE:   { label: "Annulée",    variant: "red"    },
  };
  const cfg = statusConfig[soutenance.statut] || statusConfig.PLANIFIEE;

  return (
    <Card style={{ marginBottom: 10, overflow: "hidden", animation: "fadeUp 0.3s ease both" }} hover>
      <div onClick={() => setOpen(o => !o)}
        style={{ padding: "18px 22px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14 }}>

        {/* Note circle */}
        <div style={{
          width: 52, height: 52, borderRadius: "var(--r-md)", flexShrink: 0,
          background: isTerminee ? `${noteColor}18` : "var(--surface2)",
          border: `1px solid ${isTerminee ? noteColor : "var(--border2)"}`,
          display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column",
        }}>
          {isTerminee && soutenance.note !== null ? (
            <>
              <span style={{ fontSize: 16, fontWeight: 800, color: noteColor, lineHeight: 1 }}>
                {soutenance.note.toFixed(1)}
              </span>
              <span style={{ fontSize: 9, color: noteColor, opacity: 0.7 }}>/20</span>
            </>
          ) : isPast ? (
            <Star size={18} color="var(--text-4)" />
          ) : (
            <Clock size={18} color="var(--text-4)" />
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>
            {soutenance.binome?.etudiant1?.nom}
            <span style={{ color: "var(--text-4)", fontWeight: 400, margin: "0 6px" }}>&</span>
            {soutenance.binome?.etudiant2?.nom}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 5 }}>
            {soutenance.sujet?.titre || "—"}
          </div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, color: "var(--text-4)", display: "flex", alignItems: "center", gap: 4 }}>
              <Calendar size={10} /> {creneau?.date || "—"}
            </span>
            <span style={{ fontSize: 11, color: "var(--text-4)", display: "flex", alignItems: "center", gap: 4 }}>
              <Clock size={10} /> {creneau?.heureDebut} — {creneau?.heureFin}
            </span>
            <span style={{ fontSize: 11, color: "var(--text-4)", display: "flex", alignItems: "center", gap: 4 }}>
              <MapPin size={10} /> {creneau?.salle || "—"}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Badge label={cfg.label} variant={cfg.variant} dot />
          {open ? <ChevronUp size={15} color="var(--text-4)" /> : <ChevronDown size={15} color="var(--text-4)" />}
        </div>
      </div>

      {open && (
        <div style={{ borderTop: "1px solid var(--border)", padding: "18px 22px", background: "var(--surface2)", animation: "fadeUp 0.2s ease" }}>

          {/* Jury */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-4)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>
              <Users size={10} /> Jury
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {jury.map(j => (
                <span key={j.id} style={{
                  padding: "4px 10px", borderRadius: 20, fontSize: 12,
                  background: "var(--blue-50)", color: "var(--blue-700)",
                  border: "1px solid var(--blue-200)", fontWeight: 500,
                }}>
                  {j.nom}
                </span>
              ))}
            </div>
          </div>

          {soutenance.observations && (
            <div style={{ background: "var(--surface)", border: "1px solid var(--border2)", borderRadius: "var(--r-md)", padding: "10px 14px", fontSize: 12, color: "var(--text-2)", marginBottom: 16, lineHeight: 1.5 }}>
              {soutenance.observations}
            </div>
          )}

          {/* Submit note — only if past and not yet done */}
          {isPast && !isTerminee && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
                Soumettre la note
              </div>
              {error   && <Alert type="error"   message={error}   onClose={() => setError(null)}   />}
              {success && <Alert type="success" message="Note enregistrée avec succès." />}

              <div style={{ display: "grid", gridTemplateColumns: "100px 1fr auto", gap: 10, alignItems: "end" }}>
                <div>
                  <div style={{ fontSize: 10, color: "var(--text-4)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Note /20</div>
                  <input type="number" min="0" max="20" step="0.25"
                    placeholder="0–20"
                    value={form.note}
                    onChange={e => setForm(p => ({ ...p, note: e.target.value }))}
                    style={{ width: "100%", padding: "9px 10px", borderRadius: "var(--r-md)", border: "1px solid var(--border2)", background: "var(--surface)", fontSize: 15, fontWeight: 700, textAlign: "center", outline: "none", boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "var(--text-4)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Observations</div>
                  <input placeholder="Commentaires du jury..."
                    value={form.observations}
                    onChange={e => setForm(p => ({ ...p, observations: e.target.value }))}
                    style={{ width: "100%", padding: "9px 10px", borderRadius: "var(--r-md)", border: "1px solid var(--border2)", background: "var(--surface)", fontSize: 13, outline: "none", boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "var(--text-4)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Présence</div>
                  <select value={form.present} onChange={e => setForm(p => ({ ...p, present: e.target.value }))}
                    style={{ padding: "9px 10px", borderRadius: "var(--r-md)", border: "1px solid var(--border2)", background: "var(--surface)", fontSize: 13, cursor: "pointer" }}>
                    <option value="true">Présent</option>
                    <option value="false">Absent</option>
                  </select>
                </div>
              </div>
              <Button variant="primary" size="sm" icon={CheckCircle} onClick={handleSave} disabled={saving} style={{ marginTop: 12 }}>
                {saving ? "Enregistrement..." : "Soumettre la note"}
              </Button>
            </div>
          )}

          {isTerminee && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--green-text)", fontWeight: 600 }}>
              <CheckCircle size={13} /> Note soumise — {soutenance.present ? "Étudiant présent" : "Étudiant absent"}
            </div>
          )}

          {!isPast && !isTerminee && (
            <div style={{ fontSize: 12, color: "var(--text-4)", fontStyle: "italic" }}>
              La saisie de note sera disponible après la soutenance.
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

export default function ProfSoutenances({ prof }) {
  const [soutenances, setSoutenances] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await soutenanceApi.getByProf(prof.id);
      setSoutenances(data);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [prof.id]);

  useEffect(() => { load(); }, [load]);

  const count = s => soutenances.filter(x => x.statut === s).length;

  return (
    <div style={{ animation: "fadeUp 0.4s cubic-bezier(0.16,1,0.3,1)" }}>
      <PageHeader phase="📋" title="Mes soutenances" subtitle="Soutenances pour lesquelles vous êtes membre du jury" />

      <StatBar stats={[
        { label: "Total",     value: soutenances.length,             color: "var(--blue-600)" },
        { label: "À venir",   value: count("PLANIFIEE"), total: soutenances.length, color: "var(--amber)"    },
        { label: "Terminées", value: count("TERMINEE"),  total: soutenances.length, color: "var(--green)"    },
      ]} />

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      {loading && <LoadingSkeleton rows={3} height={90} />}

      {!loading && soutenances.length === 0 && (
        <EmptyState icon={Calendar} title="Aucune soutenance assignée" description="Vous n'êtes membre d'aucun jury pour le moment." />
      )}

      {!loading && soutenances.map((s, i) => (
        <div key={s.id} style={{ animationDelay: `${i * 0.05}s` }}>
          <SoutenanceCard soutenance={s} onResultat={load} />
        </div>
      ))}
    </div>
  );
}