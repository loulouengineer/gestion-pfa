import { useState, useEffect, useCallback } from "react";
import { ClipboardList, ChevronDown, ChevronUp, Calendar, MapPin, Users, Star, CheckCircle, Clock } from "lucide-react";
import { soutenanceApi } from "../api/api";
import { Button, Badge, Card, Alert, StatBar, PageHeader, LoadingSkeleton, EmptyState } from "./ui";

function SoutenanceCard({ soutenance, onResultat, index }) {
  const [open, setOpen]   = useState(false);
  const [form, setForm]   = useState({ note: "", observations: "", present: true });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const isTerminee = soutenance.statut === "TERMINEE";
  const isAbsent   = soutenance.present === false;

  const statusConfig = {
    PLANIFIEE: { label: "Planifiée",  variant: "blue"    },
    EN_COURS:  { label: "En cours",   variant: "violet"  },
    TERMINEE:  { label: "Terminée",   variant: "green"   },
    ANNULEE:   { label: "Annulée",    variant: "red"     },
  };
  const cfg = statusConfig[soutenance.statut] || statusConfig.PLANIFIEE;

  const handleSave = async () => {
    const note = parseFloat(form.note);
    if (isNaN(note) || note < 0 || note > 20) { setError("Note invalide (0–20)."); return; }
    setSaving(true); setError(null);
    try {
      await soutenanceApi.enregistrerResultat(soutenance.id, { note, observations: form.observations, present: form.present });
      onResultat();
      setOpen(false);
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const noteColor = isTerminee && soutenance.note !== null
    ? soutenance.note >= 16 ? "var(--green)" : soutenance.note >= 12 ? "var(--blue-500)" : soutenance.note >= 10 ? "var(--amber)" : "var(--red)"
    : "var(--text-3)";

  return (
    <Card style={{
      marginBottom: 10,
      animation: `fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) ${index * 0.05}s both`,
      overflow: "hidden",
    }} hover>
      <div
        onClick={() => setOpen(o => !o)}
        style={{ padding: "18px 22px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14 }}>

        {/* Note badge */}
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
              <span style={{ fontSize: 9, color: noteColor, opacity: 0.7, fontFamily: "'JetBrains Mono', monospace" }}>/20</span>
            </>
          ) : (
            <Clock size={18} color="var(--text-4)" />
          )}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>
              {soutenance.binome?.etudiant1?.nom}
              <span style={{ color: "var(--text-4)", fontWeight: 400, margin: "0 5px" }}>&</span>
              {soutenance.binome?.etudiant2?.nom}
            </span>
            {isAbsent && <Badge label="Absent" variant="red" />}
          </div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, color: "var(--text-3)", display: "flex", alignItems: "center", gap: 4 }}>
              <Calendar size={10} /> {soutenance.creneau?.date}
            </span>
            <span style={{ fontSize: 11, color: "var(--text-3)", display: "flex", alignItems: "center", gap: 4 }}>
              <Clock size={10} /> {soutenance.creneau?.heureDebut}
            </span>
            <span style={{ fontSize: 11, color: "var(--text-3)", display: "flex", alignItems: "center", gap: 4 }}>
              <MapPin size={10} /> {soutenance.creneau?.salle}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Badge label={cfg.label} variant={cfg.variant} dot />
          {open ? <ChevronUp size={16} color="var(--text-4)" /> : <ChevronDown size={16} color="var(--text-4)" />}
        </div>
      </div>

      {open && (
        <div style={{
          borderTop: "1px solid var(--border)", padding: "18px 22px",
          background: "var(--surface2)", animation: "fadeUp 0.2s ease",
        }}>
          {/* Détails */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-4)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>Sujet</div>
              <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text-2)" }}>{soutenance.affectation?.sujet?.titre || "—"}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-4)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>Jury</div>
              <div style={{ fontSize: 12, color: "var(--text-2)" }}>
                {soutenance.jury?.map(j => j.nom).join(", ") || "—"}
              </div>
            </div>
          </div>

          {soutenance.observations && (
            <div style={{
              background: "var(--surface)", border: "1px solid var(--border2)",
              borderRadius: "var(--r-md)", padding: "10px 14px",
              fontSize: 12, color: "var(--text-2)", marginBottom: 16, lineHeight: 1.5,
            }}>
              {soutenance.observations}
            </div>
          )}

          {/* Formulaire résultat */}
          {!isTerminee && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
                Enregistrer le résultat
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "120px 1fr auto", gap: 10, alignItems: "end" }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-4)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>Note / 20</div>
                  <input
                    type="number" min="0" max="20" step="0.25"
                    placeholder="0 – 20"
                    value={form.note}
                    onChange={e => setForm(p => ({ ...p, note: e.target.value }))}
                    style={{
                      width: "100%", padding: "9px 12px", borderRadius: "var(--r-md)",
                      border: "1px solid var(--border2)", background: "var(--surface)",
                      color: "var(--text)", outline: "none", fontSize: 14, fontWeight: 700,
                      textAlign: "center",
                    }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-4)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>Observations</div>
                  <input
                    placeholder="Observations du jury..."
                    value={form.observations}
                    onChange={e => setForm(p => ({ ...p, observations: e.target.value }))}
                    style={{
                      width: "100%", padding: "9px 12px", borderRadius: "var(--r-md)",
                      border: "1px solid var(--border2)", background: "var(--surface)",
                      color: "var(--text)", outline: "none", fontSize: 13,
                    }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-4)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>Présence</div>
                  <select
                    value={form.present ? "oui" : "non"}
                    onChange={e => setForm(p => ({ ...p, present: e.target.value === "oui" }))}
                    style={{
                      padding: "9px 12px", borderRadius: "var(--r-md)",
                      border: "1px solid var(--border2)", background: "var(--surface)",
                      color: "var(--text)", fontSize: 13, cursor: "pointer",
                    }}
                  >
                    <option value="oui">Présent</option>
                    <option value="non">Absent</option>
                  </select>
                </div>
              </div>

              {error && <Alert type="error" message={error} style={{ marginTop: 10 }} />}

              <div style={{ marginTop: 12 }}>
                <Button variant="primary" size="sm" icon={CheckCircle}
                  disabled={saving} onClick={handleSave}>
                  {saving ? "Enregistrement..." : "Enregistrer le résultat"}
                </Button>
              </div>
            </div>
          )}

          {isTerminee && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--green-text)", fontWeight: 600 }}>
              <CheckCircle size={13} />
              Résultat enregistré — {soutenance.present ? "Présent" : "Absent"}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

export default function PlanningFinal() {
  const [soutenances, setSoutenances] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setSoutenances(await soutenanceApi.getPlanningFinal()); setError(null); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const count = s => soutenances.filter(s2 => s2.statut === s).length;
  const moyenneGen = soutenances
    .filter(s => s.statut === "TERMINEE" && s.note !== null)
    .reduce((acc, s, _, arr) => acc + s.note / arr.length, 0);

  return (
    <div style={{ animation: "fadeUp 0.4s cubic-bezier(0.16,1,0.3,1)" }}>
      <PageHeader phase={4}
        title="Planning final"
        subtitle="Résultats et notes des soutenances"
      />

      <StatBar stats={[
        { label: "Total",     value: soutenances.length,               color: "var(--blue-600)" },
        { label: "Planifiées",value: count("PLANIFIEE"), total: soutenances.length, color: "var(--blue-500)"  },
        { label: "Terminées", value: count("TERMINEE"),  total: soutenances.length, color: "var(--green)"    },
        { label: "Moy. gén.", value: moyenneGen > 0 ? moyenneGen.toFixed(2) : "—", color: "var(--violet)"   },
      ]} />

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {loading && <LoadingSkeleton rows={4} height={80} />}

      {!loading && soutenances.length === 0 && (
        <EmptyState icon={ClipboardList}
          title="Aucune soutenance planifiée"
          description="Planifiez les soutenances dans la Phase 3 pour les voir apparaître ici." />
      )}

      {!loading && soutenances.map((s, i) => (
        <SoutenanceCard key={s.id} soutenance={s} index={i} onResultat={load} />
      ))}
    </div>
  );
}