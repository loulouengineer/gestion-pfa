import { useState, useEffect, useCallback } from "react";
import { sujetApi, affectationApi } from "../api/api";
import { PageHeader, Alert, LoadingSkeleton, EmptyState, Badge, Button } from "./ui";
import { ClipboardList, CheckCircle, XCircle, Clock, Filter, Users, BookOpen, Star, Zap, RotateCcw } from "lucide-react";

const STATUS_CONFIG = {
  EN_ATTENTE: { label: "En attente", variant: "amber", icon: Clock       },
  VALIDEE:    { label: "Validée",    variant: "green", icon: CheckCircle },
  REFUSEE:    { label: "Refusée",    variant: "red",   icon: XCircle     },
};

const DIFF_LABEL = { 1: "Très facile", 2: "Facile", 3: "Moyen", 4: "Difficile", 5: "Très difficile" };
const DIFF_COLOR = { 1: "#10b981", 2: "#3b82f6", 3: "#f59e0b", 4: "#f97316", 5: "#ef4444" };

function AffectationCard({ demande, onValider, onRefuser, actionLoading, index }) {
  const [openRefus, setOpenRefus]     = useState(false);
  const [commentaire, setCommentaire] = useState("");

  const statut     = demande.statut || "EN_ATTENTE";
  const cfg        = STATUS_CONFIG[statut] || STATUS_CONFIG.EN_ATTENTE;
  const StatusIcon = cfg.icon;
  const isPending  = statut === "EN_ATTENTE";
  const diff       = demande.sujet?.difficulte || 3;
  const score      = demande.score != null ? Number(demande.score).toFixed(2) : "—";

  const borderColor = isPending ? "var(--amber)"
    : statut === "VALIDEE" ? "var(--green)" : "var(--red)";

  return (
    <div style={{
      background: "var(--surface)", borderRadius: "var(--r-lg)",
      border: "1px solid var(--border2)", borderLeft: `4px solid ${borderColor}`,
      boxShadow: isPending ? "var(--shadow-md)" : "var(--shadow-xs)",
      padding: "20px 24px", marginBottom: 12,
      animation: `fadeUp 0.35s cubic-bezier(0.16,1,0.3,1) ${(index || 0) * 0.05}s both`,
      opacity: statut === "REFUSEE" ? 0.7 : 1,
    }}>
      {/* Header — binome */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{
            width: 42, height: 42, borderRadius: "var(--r-md)", flexShrink: 0,
            background: "var(--surface2)", border: "1px solid var(--border2)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Users size={18} color="var(--text-4)" />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 3 }}>
              {demande.binome?.etudiant1} &amp; {demande.binome?.etudiant2}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-4)", fontFamily: "'JetBrains Mono', monospace" }}>
              Moy. {Number(demande.binome?.moyenne || 0).toFixed(2)} / 20
              <span style={{ margin: "0 6px", opacity: 0.4 }}>·</span>
              Score algorithme : <strong style={{ color: "var(--blue-600)" }}>{score}</strong>
            </div>
          </div>
        </div>
        <Badge label={cfg.label} variant={cfg.variant} dot />
      </div>

      {/* Sujet assigné */}
      <div style={{
        background: "var(--surface2)", borderRadius: "var(--r-md)",
        border: "1px solid var(--border)", padding: "12px 16px", marginBottom: 14,
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <BookOpen size={13} color="var(--text-4)" />
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>
                {demande.sujet?.titre || "—"}
              </span>
            </div>
            <div style={{ fontSize: 11, color: "var(--text-3)" }}>
              Encadrant : {demande.sujet?.encadrant || "—"}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
            <Star size={11} color={DIFF_COLOR[diff]} />
            <span style={{ fontSize: 11, color: DIFF_COLOR[diff], fontWeight: 600 }}>
              {DIFF_LABEL[diff] || "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      {isPending && !openRefus && (
        <div style={{ display: "flex", gap: 8 }}>
          <Button variant="success" size="sm" icon={CheckCircle}
            disabled={actionLoading === demande.affectationId + "-valider"}
            onClick={() => onValider(demande)}>
            {actionLoading === demande.affectationId + "-valider" ? "..." : "Valider"}
          </Button>
          <Button variant="danger" size="sm" icon={XCircle}
            onClick={() => setOpenRefus(true)}>
            Refuser
          </Button>
        </div>
      )}

      {isPending && openRefus && (
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
            Raison du refus
          </div>
          <input autoFocus
            placeholder="Expliquez la raison du refus..."
            value={commentaire}
            onChange={e => setCommentaire(e.target.value)}
            style={{
              width: "100%", padding: "9px 12px", borderRadius: "var(--r-md)",
              border: "1px solid var(--red)", background: "var(--surface)",
              color: "var(--text)", outline: "none", fontSize: 13, marginBottom: 10,
              boxShadow: "0 0 0 3px rgba(239,68,68,0.08)", boxSizing: "border-box",
            }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="danger" size="sm"
              disabled={actionLoading === demande.affectationId + "-refuser"}
              onClick={() => onRefuser(demande, commentaire)}>
              {actionLoading === demande.affectationId + "-refuser" ? "..." : "Confirmer"}
            </Button>
            <Button variant="ghost" size="sm"
              onClick={() => { setOpenRefus(false); setCommentaire(""); }}>
              Annuler
            </Button>
          </div>
        </div>
      )}

      {!isPending && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600,
          color: statut === "VALIDEE" ? "var(--green-text)" : "var(--red-text)" }}>
          <StatusIcon size={13} />
          {statut === "VALIDEE" ? "Affectation validée" : `Refusée${demande.commentaireAdmin ? ` — ${demande.commentaireAdmin}` : ""}`}
        </div>
      )}
    </div>
  );
}

export default function DemandesSujets() {
  const [demandes, setDemandes]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [running, setRunning]             = useState(false);
  const [error, setError]                 = useState(null);
  const [success, setSuccess]             = useState(null);
  const [filter, setFilter]               = useState("TOUT");
  const [actionLoading, setActionLoading] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await sujetApi.getDemandes();
      setDemandes(Array.isArray(data) ? data : []);
      setError(null);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleLancer = async () => {
    const hasExisting = demandes.length > 0;
    if (hasExisting && !window.confirm(
      "Relancer l'algorithme va réinitialiser toutes les affectations existantes. Continuer ?"
    )) return;

    setRunning(true); setError(null); setSuccess(null);
    try {
      const results = await affectationApi.lancerAlgorithme();
      setSuccess(`Algorithme terminé — ${results.length} affectation(s) générée(s).`);
      setTimeout(() => setSuccess(null), 4000);
      await load();
    } catch (e) { setError(e.message); }
    finally { setRunning(false); }
  };

  const handleValider = async (demande) => {
    setActionLoading(demande.affectationId + "-valider");
    try {
      await affectationApi.valider(demande.affectationId);
      setSuccess("Affectation validée.");
      setTimeout(() => setSuccess(null), 3000);
      await load();
    } catch (e) { setError(e.message); }
    finally { setActionLoading(null); }
  };

  const handleRefuser = async (demande, commentaire) => {
    if (!commentaire?.trim()) { setError("Commentaire obligatoire."); return; }
    setActionLoading(demande.affectationId + "-refuser");
    try {
      await affectationApi.refuser(demande.affectationId, commentaire);
      setSuccess("Affectation refusée.");
      setTimeout(() => setSuccess(null), 3000);
      await load();
    } catch (e) { setError(e.message); }
    finally { setActionLoading(null); }
  };

  const count    = (s) => demandes.filter(d => d.statut === s).length;
  const filtered = filter === "TOUT" ? demandes : demandes.filter(d => d.statut === filter);

  const FILTERS = [
    { id: "TOUT",       label: "Toutes",     count: demandes.length     },
    { id: "EN_ATTENTE", label: "En attente", count: count("EN_ATTENTE") },
    { id: "VALIDEE",    label: "Validées",   count: count("VALIDEE")    },
    { id: "REFUSEE",    label: "Refusées",   count: count("REFUSEE")    },
  ];

  return (
    <div style={{ animation: "fadeUp 0.4s cubic-bezier(0.16,1,0.3,1)" }}>
      <PageHeader phase={1} title="Affectation des sujets"
        subtitle="Lancez l'algorithme pour affecter automatiquement chaque binôme à son meilleur sujet disponible"
        action={
          <Button
            variant={demandes.length > 0 ? "secondary" : "primary"}
            icon={demandes.length > 0 ? RotateCcw : Zap}
            onClick={handleLancer}
            disabled={running}
          >
            {running ? "Algorithme en cours..." : demandes.length > 0 ? "Relancer l'algorithme" : "Lancer l'algorithme"}
          </Button>
        }
      />

      {/* Algorithm explanation banner — shown only when no affectations yet */}
      {!loading && demandes.length === 0 && (
        <div style={{
          background: "var(--blue-50)", border: "1px solid var(--blue-200)",
          borderRadius: "var(--r-lg)", padding: "20px 24px", marginBottom: 24,
          display: "flex", gap: 16, alignItems: "flex-start",
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: "var(--r-md)", flexShrink: 0,
            background: "var(--blue-600)", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Zap size={18} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--blue-700)", marginBottom: 4 }}>
              Algorithme d'affectation glouton
            </div>
            <div style={{ fontSize: 13, color: "var(--blue-600)", lineHeight: 1.6 }}>
              Les binômes sont triés par moyenne décroissante. Chaque binôme reçoit son premier choix encore disponible.
              Le score est calculé selon : <strong>moyenne × bonus de priorité du choix</strong> (choix 1 = bonus max).
            </div>
            <div style={{ marginTop: 12 }}>
              <Button variant="primary" icon={Zap} onClick={handleLancer} disabled={running}>
                {running ? "Algorithme en cours..." : "Lancer l'algorithme d'affectation"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      {demandes.length > 0 && (
        <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
          {[
            { label: "En attente", value: count("EN_ATTENTE"), color: "#f59e0b", bg: "#fef3c7" },
            { label: "Validées",   value: count("VALIDEE"),    color: "#10b981", bg: "#d1fae5" },
            { label: "Refusées",   value: count("REFUSEE"),    color: "#ef4444", bg: "#fee2e2" },
            { label: "Total",      value: demandes.length,     color: "#2563eb", bg: "#dbeafe" },
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
      )}

      {error   && <Alert type="error"   message={error}   onClose={() => setError(null)}   />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}

      {/* Running overlay */}
      {running && (
        <div style={{
          background: "var(--blue-50)", border: "1px solid var(--blue-200)",
          borderRadius: "var(--r-lg)", padding: "20px 24px", marginBottom: 20,
          display: "flex", alignItems: "center", gap: 14,
        }}>
          <div style={{
            width: 20, height: 20, borderRadius: "50%",
            border: "2.5px solid var(--blue-600)", borderTopColor: "transparent",
            animation: "spin 0.7s linear infinite", flexShrink: 0,
          }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--blue-700)" }}>
              Algorithme en cours d'exécution...
            </div>
            <div style={{ fontSize: 11, color: "var(--blue-600)", marginTop: 2 }}>
              Tri des binômes par moyenne · Affectation par choix prioritaire
            </div>
          </div>
        </div>
      )}

      {/* Filters — only when results exist */}
      {!loading && demandes.length > 0 && (
        <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
          <Filter size={13} color="var(--text-4)" style={{ marginRight: 4 }} />
          {FILTERS.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "6px 14px", borderRadius: 20, cursor: "pointer",
                border: `1.5px solid ${filter === f.id ? "var(--blue-500)" : "var(--border2)"}`,
                background: filter === f.id ? "var(--blue-50)" : "var(--surface)",
                color: filter === f.id ? "var(--blue-700)" : "var(--text-3)",
                fontSize: 12, fontWeight: filter === f.id ? 700 : 500,
                transition: "all 0.15s",
              }}>
              {f.label}
              <span style={{
                minWidth: 18, height: 18, borderRadius: 20, padding: "0 5px",
                background: filter === f.id ? "var(--blue-600)" : "var(--surface2)",
                color: filter === f.id ? "#fff" : "var(--text-3)",
                fontSize: 10, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {f.count}
              </span>
            </button>
          ))}
        </div>
      )}

      {loading && <LoadingSkeleton rows={3} height={160} />}

      {!loading && demandes.length > 0 && filtered.length === 0 && (
        <EmptyState icon={ClipboardList}
          title="Aucune affectation"
          description="Aucune affectation dans cette catégorie." />
      )}

      {!loading && filtered.map((d, i) => (
        <AffectationCard key={d.affectationId || i} demande={d} index={i}
          onValider={handleValider} onRefuser={handleRefuser}
          actionLoading={actionLoading} />
      ))}

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
