import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock, BookOpen, Tag, Wrench } from "lucide-react";
import { PageHeader, Badge, Card, EmptyState, LoadingSkeleton } from "./ui";
import api from "../api/axios";

function ProjetCard({ projet, onChangerStatut, index }) {
  const isPending = projet.statut === "EN_ATTENTE";

  const statusConfig = {
    EN_ATTENTE: { label: "En attente", variant: "amber" },
    APPROUVE:   { label: "Approuvé",   variant: "green" },
    REFUSE:     { label: "Refusé",     variant: "red"   },
  };
  const cfg = statusConfig[projet.statut] || statusConfig.EN_ATTENTE;

  return (
    <Card style={{
      padding: "22px 26px", marginBottom: 12,
      animation: `fadeUp 0.35s cubic-bezier(0.16,1,0.3,1) ${(index || 0) * 0.05}s both`,
      borderLeft: `4px solid ${isPending ? "#f59e0b" : projet.statut === "APPROUVE" ? "#10b981" : "#ef4444"}`,
    }} hover>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12, gap: 12 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div style={{
            width: 40, height: 40, borderRadius: "var(--r-md)", flexShrink: 0,
            background: "var(--blue-50)", border: "1px solid var(--blue-200)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <BookOpen size={16} color="var(--blue-600)" />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 3, letterSpacing: "-0.2px" }}>
              {projet.titre}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 500 }}>
              Proposé par : <span style={{ color: "var(--text-2)", fontWeight: 600 }}>
                {projet.professeur || projet.enseignant?.nom || "Inconnu"}
              </span>
            </div>
          </div>
        </div>
        <Badge label={cfg.label} variant={cfg.variant} dot />
      </div>

      {projet.description && (
        <div style={{
          fontSize: 13, color: "var(--text-3)", lineHeight: 1.6,
          marginBottom: 14, padding: "10px 14px",
          background: "var(--surface2)", borderRadius: "var(--r-md)",
          border: "1px solid var(--border)",
        }}>
          {projet.description}
        </div>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 14 }}>
        {projet.motsCles?.length > 0 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
              <Tag size={11} color="var(--text-4)" />
              <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-4)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Mots-clés
              </span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {projet.motsCles.map((m, i) => (
                <span key={i} style={{
                  padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 500,
                  background: "var(--blue-50)", color: "var(--blue-700)",
                  border: "1px solid var(--blue-200)",
                }}>{m}</span>
              ))}
            </div>
          </div>
        )}

        {projet.competences?.length > 0 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
              <Wrench size={11} color="var(--text-4)" />
              <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-4)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Compétences
              </span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {projet.competences.map((c, i) => (
                <span key={i} style={{
                  padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 500,
                  background: "var(--surface2)", color: "var(--text-2)",
                  border: "1px solid var(--border2)",
                }}>{c}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {projet.dateProposition && (
        <div style={{ fontSize: 11, color: "var(--text-4)", marginBottom: 14, fontFamily: "'JetBrains Mono', monospace" }}>
          Proposé le {projet.dateProposition}
        </div>
      )}

      {isPending && (
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => onChangerStatut(projet.id, "APPROUVE")}
            style={{
              flex: 1, padding: "10px", borderRadius: "var(--r-md)", border: "none",
              background: "#10b981", color: "#fff", fontSize: 13, fontWeight: 700,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              boxShadow: "0 2px 8px rgba(16,185,129,0.3)", transition: "opacity 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            <CheckCircle size={14} /> Approuver
          </button>
          <button
            onClick={() => onChangerStatut(projet.id, "REFUSE")}
            style={{
              flex: 1, padding: "10px", borderRadius: "var(--r-md)", border: "none",
              background: "#ef4444", color: "#fff", fontSize: 13, fontWeight: 700,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              boxShadow: "0 2px 8px rgba(239,68,68,0.3)", transition: "opacity 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            <XCircle size={14} /> Refuser
          </button>
        </div>
      )}

      {!isPending && (
        <div style={{
          display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600,
          color: projet.statut === "APPROUVE" ? "#065f46" : "#991b1b",
        }}>
          {projet.statut === "APPROUVE" ? <CheckCircle size={13} /> : <XCircle size={13} />}
          {projet.statut === "APPROUVE" ? "Sujet approuvé" : "Sujet refusé"}
        </div>
      )}
    </Card>
  );
}

export default function SujetsValidation() {
  const [activeTab, setActiveTab] = useState("EN_ATTENTE");
  const [sujets, setSujets]       = useState([]);
  const [loading, setLoading]     = useState(true);

  const fetchSujets = async () => {
    setLoading(true);
    try {
      const response = await api.get("/sujets");
      setSujets(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSujets(); }, []);

  const handleChangerStatut = async (id, statut) => {
    try {
      await api.patch(`/sujets/${id}/statut`, null, { params: { statut } });
      fetchSujets();
    } catch (err) { console.error(err); }
  };

  const count = s => sujets.filter(x => x.statut === s).length;
  const filtered = sujets.filter(s => s.statut === activeTab);

  const TABS = [
    { id: "EN_ATTENTE", label: "En attente", count: count("EN_ATTENTE"), icon: Clock        },
    { id: "APPROUVE",   label: "Approuvés",  count: count("APPROUVE"),   icon: CheckCircle  },
    { id: "REFUSE",     label: "Refusés",    count: count("REFUSE"),     icon: XCircle      },
  ];

  return (
    <div style={{ animation: "fadeUp 0.4s cubic-bezier(0.16,1,0.3,1)" }}>
      <PageHeader phase={1} title="Validation des sujets"
        subtitle="Approuvez ou refusez les sujets proposés par les professeurs" />

      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Total",      value: sujets.length,       color: "#2563eb", bg: "#dbeafe" },
          { label: "En attente", value: count("EN_ATTENTE"), color: "#f59e0b", bg: "#fef3c7" },
          { label: "Approuvés",  value: count("APPROUVE"),   color: "#10b981", bg: "#d1fae5" },
          { label: "Refusés",    value: count("REFUSE"),     color: "#ef4444", bg: "#fee2e2" },
        ].map(s => (
          <div key={s.label} style={{
            background: s.bg, borderRadius: 12, padding: "14px 20px",
            display: "flex", alignItems: "center", gap: 10, flex: 1,
          }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: s.color, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {TABS.map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "7px 16px", borderRadius: 20, cursor: "pointer",
                border: `1.5px solid ${isActive ? "#2563eb" : "var(--border2)"}`,
                background: isActive ? "#dbeafe" : "var(--surface)",
                color: isActive ? "#1d4ed8" : "var(--text-3)",
                fontSize: 12, fontWeight: isActive ? 700 : 500,
                transition: "all 0.15s",
              }}>
              <Icon size={12} />
              {t.label}
              <span style={{
                minWidth: 18, height: 18, borderRadius: 20, padding: "0 5px",
                background: isActive ? "#2563eb" : "var(--surface2)",
                color: isActive ? "#fff" : "var(--text-3)",
                fontSize: 10, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      {loading && <LoadingSkeleton rows={3} height={180} />}

      {!loading && filtered.length === 0 && (
        <EmptyState icon={BookOpen}
          title="Aucun sujet"
          description={`Aucun sujet ${activeTab === "EN_ATTENTE" ? "en attente" : activeTab === "APPROUVE" ? "approuvé" : "refusé"}.`}
        />
      )}

      {!loading && filtered.map((p, i) => (
        <ProjetCard key={p.id} projet={p} index={i} onChangerStatut={handleChangerStatut} />
      ))}
    </div>
  );
}
