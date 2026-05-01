import { useState, useEffect } from "react";
import { affectationApi } from "../api/api";
import { Card, StatBar, PageHeader, LoadingSkeleton, EmptyState, Alert, Badge } from "./ui";
import { CheckSquare, Search, User, Users, BookOpen } from "lucide-react";

export default function SujetsAcceptes() {
  const [affectations, setAffectations] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [search, setSearch]             = useState("");
  const [filterEncadrant, setFilterEncadrant] = useState("");

  useEffect(() => {
    affectationApi.getAll()
      .then(data => setAffectations((data || []).filter(a => a.statut === "VALIDEE")))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const encadrants = [...new Set(affectations.map(a => a.sujet?.encadrant?.nom).filter(Boolean))].sort();

  const filtered = affectations.filter(a => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      a.sujet?.titre?.toLowerCase().includes(q) ||
      a.binome?.etudiant1?.nom?.toLowerCase().includes(q) ||
      a.binome?.etudiant2?.nom?.toLowerCase().includes(q) ||
      a.sujet?.encadrant?.nom?.toLowerCase().includes(q);
    const matchEncadrant = !filterEncadrant || a.sujet?.encadrant?.nom === filterEncadrant;
    return matchSearch && matchEncadrant;
  });

  return (
    <div style={{ animation: "fadeUp 0.4s cubic-bezier(0.16,1,0.3,1)" }}>
      <PageHeader phase="✅" title="Sujets acceptés"
        subtitle="Liste des sujets validés et leurs binômes affectés" />

      <StatBar stats={[
        { label: "Total validés", value: affectations.length, color: "var(--green)" },
        { label: "Affichés",      value: filtered.length,     color: "var(--blue-600)" },
      ]} />

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 220, position: "relative" }}>
          <Search size={13} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-4)", pointerEvents: "none" }} />
          <input
            placeholder="Rechercher par titre, étudiant ou encadrant..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: "100%", padding: "9px 10px 9px 32px", borderRadius: "var(--r-md)",
              border: "1px solid var(--border2)", background: "var(--surface)",
              fontSize: 13, outline: "none", color: "var(--text)", boxSizing: "border-box",
            }}
          />
        </div>
        <select value={filterEncadrant} onChange={e => setFilterEncadrant(e.target.value)}
          style={{
            padding: "9px 10px", borderRadius: "var(--r-md)", border: "1px solid var(--border2)",
            background: "var(--surface)", fontSize: 13, color: "var(--text)", cursor: "pointer", minWidth: 180,
          }}>
          <option value="">Tous les encadrants</option>
          {encadrants.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
      </div>

      {loading && <LoadingSkeleton rows={4} height={80} />}

      {!loading && filtered.length === 0 && (
        <EmptyState icon={CheckSquare} title="Aucun sujet accepté" description="Aucun sujet validé ne correspond à vos critères." />
      )}

      {!loading && filtered.map((a, i) => (
        <Card key={a.id} style={{ marginBottom: 10, animation: "fadeUp 0.3s ease both", animationDelay: `${i * 0.04}s` }} hover>
          <div style={{ padding: "18px 22px", display: "flex", alignItems: "flex-start", gap: 16 }}>

            {/* Icon */}
            <div style={{
              width: 42, height: 42, borderRadius: "var(--r-md)", flexShrink: 0,
              background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <BookOpen size={16} color="#10b981" />
            </div>

            {/* Main info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>
                {a.sujet?.titre || "—"}
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
                <span style={{ fontSize: 12, color: "var(--text-3)", display: "flex", alignItems: "center", gap: 5 }}>
                  <User size={11} color="var(--text-4)" />
                  <span style={{ fontWeight: 600, color: "var(--text-4)" }}>Encadrant :</span>
                  &nbsp;{a.sujet?.encadrant?.nom || "—"}
                </span>
                <span style={{ fontSize: 12, color: "var(--text-3)", display: "flex", alignItems: "center", gap: 5 }}>
                  <Users size={11} color="var(--text-4)" />
                  <span style={{ fontWeight: 600, color: "var(--text-4)" }}>Binôme :</span>
                  &nbsp;{a.binome?.etudiant1?.nom || "—"}
                  <span style={{ color: "var(--text-4)", margin: "0 2px" }}>&amp;</span>
                  {a.binome?.etudiant2?.nom || "—"}
                </span>
              </div>
            </div>

            <Badge label="Validé" variant="green" dot />
          </div>
        </Card>
      ))}
    </div>
  );
}
