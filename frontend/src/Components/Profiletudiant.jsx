import React, { useState, useEffect } from "react";
import api from "../api/axios";

export default function Profiletudiant({ onMoyenneChange }) {
  const [profil, setProfil] = useState(null);
  const [moyenne, setMoyenne] = useState("");
  const [competences, setCompetences] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProfil();
  }, []);

  const fetchProfil = async () => {
    setLoading(true);
    try {
      const response = await api.get("/etudiants/profil");
      setProfil(response.data);
      setMoyenne(response.data.moyenne || "");
      setCompetences(response.data.competences ? response.data.competences.join(", ") : "");
    } catch (err) {
      console.error("Erreur chargement profil", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!moyenne || parseFloat(moyenne) < 0 || parseFloat(moyenne) > 20) {
      setError("La moyenne doit être entre 0 et 20");
      return;
    }
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await api.put("/etudiants/profil", {
        moyenne: parseFloat(moyenne),
        competences: competences.split(",").map((c) => c.trim()).filter((c) => c),
      });
      setMessage("Profil mis à jour avec succès !");
      localStorage.setItem("moyenne", parseFloat(moyenne));
      if (onMoyenneChange) onMoyenneChange(parseFloat(moyenne));
      fetchProfil();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la mise à jour");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{padding:"20px"}}>Chargement...</div>;

  return (
    <div>
      {/* INFOS PERSONNELLES */}
      <div style={{
        background: "#fff", borderRadius: "12px",
        border: "0.5px solid #e2e8f0", padding: "24px", marginBottom: "16px"
      }}>
        <p style={{ fontSize: "12px", fontWeight: 500, color: "#64748b", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: "16px" }}>
          Informations personnelles
        </p>
        {[
          { label: "Nom complet", value: profil ? `${profil.nom} ${profil.prenom}` : "-" },
          { label: "Email", value: profil?.email || "-" },
          { label: "Matricule", value: profil?.matricule || "-" },
          { label: "Statut", value: "APPROUVÉ", badge: true },
        ].map((row) => (
          <div key={row.label} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "10px 0", borderBottom: "0.5px solid #f1f5f9"
          }}>
            <span style={{ fontSize: "13px", color: "#64748b" }}>{row.label}</span>
            {row.badge ? (
              <span style={{ background: "#f0fdf4", color: "#16a34a", padding: "3px 10px", borderRadius: "20px", fontSize: "12px" }}>
                ✓ {row.value}
              </span>
            ) : (
              <span style={{ fontSize: "13px", fontWeight: 500, color: "#1e293b" }}>{row.value}</span>
            )}
          </div>
        ))}
      </div>

      {/* INFOS ACADÉMIQUES */}
      <div style={{
        background: "#fff", borderRadius: "12px",
        border: "0.5px solid #e2e8f0", padding: "24px"
      }}>
        <p style={{ fontSize: "12px", fontWeight: 500, color: "#64748b", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: "16px" }}>
          Informations académiques
        </p>

        {message && (
          <div style={{ background: "#f0fdf4", color: "#16a34a", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px", border: "1px solid #bbf7d0" }}>
            ✓ {message}
          </div>
        )}
        {error && (
          <div style={{ background: "#fef2f2", color: "#dc2626", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px", border: "1px solid #fecaca" }}>
            ✗ {error}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "13px", color: "#374151", fontWeight: 500 }}>Moyenne générale (sur 20)</label>
            <input
              type="number" min="0" max="20" step="0.1"
              placeholder="ex: 14.5" value={moyenne}
              onChange={(e) => setMoyenne(e.target.value)}
              style={{ padding: "8px 12px", border: "0.5px solid #cbd5e1", borderRadius: "8px", fontSize: "14px" }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "13px", color: "#374151", fontWeight: 500 }}>Matricule</label>
            <input
              type="text" value={profil?.matricule || ""} disabled
              style={{ padding: "8px 12px", border: "0.5px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", background: "#f8fafc", color: "#94a3b8" }}
            />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "20px" }}>
          <label style={{ fontSize: "13px", color: "#374151", fontWeight: 500 }}>
            Compétences <span style={{ color: "#94a3b8", fontWeight: 400 }}>(séparées par virgules)</span>
          </label>
          <input
            type="text" placeholder="ex: Java, React, Python"
            value={competences} onChange={(e) => setCompetences(e.target.value)}
            style={{ padding: "8px 12px", border: "0.5px solid #cbd5e1", borderRadius: "8px", fontSize: "14px" }}
          />
          {competences && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "6px" }}>
              {competences.split(",").map((c) => c.trim()).filter((c) => c).map((c, i) => (
                <span key={i} style={{ background: "#eff6ff", color: "#1d4ed8", padding: "2px 8px", borderRadius: "20px", fontSize: "12px" }}>
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleSave} disabled={saving}
          style={{ background: saving ? "#93c5fd" : "#3b82f6", color: "#fff", border: "none", padding: "10px 24px", borderRadius: "8px", fontSize: "14px", cursor: saving ? "not-allowed" : "pointer", fontWeight: 500 }}
        >
          {saving ? "Enregistrement..." : "Enregistrer le profil"}
        </button>
      </div>
    </div>
  );
}