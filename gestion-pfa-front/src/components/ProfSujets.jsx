import { useState, useEffect, useCallback } from "react";
import { sujetApi } from "../api/api";
import { PageHeader, StatBar, Alert, LoadingSkeleton, EmptyState, Button, Badge } from "./ui";
import { BookOpen, Plus, Star, Edit3, Trash2, X, Check } from "lucide-react";

const DIFF_CONFIG = {
  1: { label: "Très facile", color: "#10b981", bg: "#d1fae5" },
  2: { label: "Facile",      color: "#3b82f6", bg: "#dbeafe" },
  3: { label: "Moyen",       color: "#f59e0b", bg: "#fef3c7" },
  4: { label: "Difficile",   color: "#f97316", bg: "#ffedd5" },
  5: { label: "Très diff.",  color: "#ef4444", bg: "#fee2e2" },
};

function SujetCard({ sujet, onEdit, onDelete, index }) {
  const diff = DIFF_CONFIG[sujet.difficulte] || DIFF_CONFIG[3];
  return (
    <div style={{
      background: "var(--surface)", borderRadius: "var(--r-xl)",
      border: "1px solid var(--border2)", boxShadow: "var(--shadow-sm)",
      overflow: "hidden",
      animation: `fadeUp 0.35s cubic-bezier(0.16,1,0.3,1) ${index * 0.06}s both`,
      transition: "box-shadow 0.2s, transform 0.2s",
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "var(--shadow-md)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "var(--shadow-sm)"; e.currentTarget.style.transform = "none"; }}
    >
      {/* Color bar */}
      <div style={{ height: 4, background: diff.color }} />

      <div style={{ padding: "20px 22px" }}>
        {/* Title row */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", lineHeight: 1.3, flex: 1 }}>
            {sujet.titre}
          </div>
          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
            <button onClick={() => onEdit(sujet)}
              style={{ background: "var(--surface2)", border: "1px solid var(--border2)", borderRadius: "var(--r-sm)", padding: "5px 8px", cursor: "pointer", display: "flex", alignItems: "center" }}>
              <Edit3 size={12} color="var(--text-3)" />
            </button>
            <button onClick={() => onDelete(sujet.id)}
              style={{ background: "var(--red-bg)", border: "1px solid var(--red)", borderRadius: "var(--r-sm)", padding: "5px 8px", cursor: "pointer", display: "flex", alignItems: "center" }}>
              <Trash2 size={12} color="var(--red-text)" />
            </button>
          </div>
        </div>

        {/* Description */}
        {sujet.description && (
          <div style={{ fontSize: 12, color: "var(--text-3)", lineHeight: 1.6, marginBottom: 14 }}>
            {sujet.description}
          </div>
        )}

        {/* Footer badges */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "4px 10px", borderRadius: 20,
            background: diff.bg, border: `1px solid ${diff.color}`,
            fontSize: 11, fontWeight: 600, color: diff.color,
          }}>
            <Star size={10} />
            {diff.label}
          </div>
          <Badge
            label={sujet.disponible ? "Disponible" : "Non disponible"}
            variant={sujet.disponible ? "green" : "red"}
            dot
          />
        </div>
      </div>
    </div>
  );
}

function SujetFormModal({ prof, sujet, onSave, onClose }) {
  const isEdit = !!sujet;
  const [form, setForm] = useState({
    titre:       sujet?.titre       || "",
    description: sujet?.description || "",
    difficulte:  sujet?.difficulte  || 3,
    disponible:  sujet?.disponible  !== false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState(null);

  const handleSave = async () => {
    if (!form.titre.trim()) { setError("Le titre est obligatoire."); return; }
    setSaving(true); setError(null);
    try {
      if (isEdit) {
        await sujetApi.modifier(sujet.id, form);
      } else {
        await sujetApi.creer({ ...form, encadrantId: prof.id });
      }
      onSave();
      onClose();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const inputStyle = {
    width: "100%", padding: "9px 12px", borderRadius: "var(--r-md)",
    border: "1px solid var(--border2)", background: "var(--surface)",
    color: "var(--text)", fontSize: 13, outline: "none", boxSizing: "border-box",
  };
  const labelStyle = {
    fontSize: 10, fontWeight: 700, color: "var(--text-4)",
    textTransform: "uppercase", letterSpacing: "0.06em",
    display: "block", marginBottom: 6,
  };

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3000, padding: 20 }}>
      <div style={{
        background: "var(--surface)", borderRadius: "var(--r-xl)",
        border: "1px solid var(--border2)", padding: "28px 32px",
        width: 480, boxShadow: "var(--shadow-xl)",
        animation: "scaleIn 0.2s cubic-bezier(0.16,1,0.3,1)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>
            {isEdit ? "Modifier le sujet" : "Nouveau sujet"}
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-4)" }}>
            <X size={16} />
          </button>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={labelStyle}>Titre *</label>
            <input value={form.titre} onChange={e => setForm(p => ({ ...p, titre: e.target.value }))}
              placeholder="Titre du sujet PFA" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Description</label>
            <textarea value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Description du sujet..."
              rows={3} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }} />
          </div>
          <div>
            <label style={labelStyle}>Niveau de difficulté</label>
            <div style={{ display: "flex", gap: 6 }}>
              {[1,2,3,4,5].map(n => {
                const d = DIFF_CONFIG[n];
                const sel = form.difficulte === n;
                return (
                  <button key={n} onClick={() => setForm(p => ({ ...p, difficulte: n }))}
                    style={{
                      flex: 1, padding: "7px 4px", borderRadius: "var(--r-sm)", cursor: "pointer",
                      border: `1.5px solid ${sel ? d.color : "var(--border2)"}`,
                      background: sel ? d.bg : "transparent",
                      fontSize: 10, fontWeight: 700, color: sel ? d.color : "var(--text-4)",
                      transition: "all 0.15s",
                    }}>
                    {n}
                  </button>
                );
              })}
            </div>
            <div style={{ fontSize: 11, color: DIFF_CONFIG[form.difficulte]?.color, marginTop: 5, fontWeight: 600, textAlign: "center" }}>
              {DIFF_CONFIG[form.difficulte]?.label}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input type="checkbox" id="dispo" checked={form.disponible}
              onChange={e => setForm(p => ({ ...p, disponible: e.target.checked }))}
              style={{ width: 16, height: 16, cursor: "pointer" }} />
            <label htmlFor="dispo" style={{ fontSize: 13, color: "var(--text-2)", cursor: "pointer" }}>
              Sujet disponible pour les étudiants
            </label>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <Button variant="primary" icon={Check} onClick={handleSave} disabled={saving} style={{ flex: 1 }}>
            {saving ? "Enregistrement..." : isEdit ? "Mettre à jour" : "Créer le sujet"}
          </Button>
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
        </div>
      </div>
    </div>
  );
}

export default function ProfSujets({ prof }) {
  const [sujets, setSujets]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [success, setSuccess]   = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editSujet, setEditSujet] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setSujets(await sujetApi.getByEncadrant(prof.id)); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [prof.id]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce sujet ?")) return;
    try {
      await sujetApi.supprimer(id);
      setSuccess("Sujet supprimé.");
      setTimeout(() => setSuccess(null), 2000);
      await load();
    } catch (e) { setError(e.message); }
  };

  const handleEdit = (sujet) => { setEditSujet(sujet); setShowForm(true); };
  const handleNew  = ()      => { setEditSujet(null); setShowForm(true); };

  const handleSave = async () => {
    setSuccess(editSujet ? "Sujet mis à jour." : "Sujet créé.");
    setTimeout(() => setSuccess(null), 2000);
    await load();
  };

  return (
    <div style={{ animation: "fadeUp 0.4s cubic-bezier(0.16,1,0.3,1)" }}>
      <PageHeader phase="📚" title="Mes sujets"
        subtitle="Sujets PFA que vous proposez aux étudiants"
        action={
          <Button variant="primary" icon={Plus} onClick={handleNew}>
            Nouveau sujet
          </Button>
        }
      />

      <StatBar stats={[
        { label: "Total",          value: sujets.length,                                   color: "var(--blue-600)" },
        { label: "Disponibles",    value: sujets.filter(s => s.disponible).length,  total: sujets.length, color: "var(--green)" },
        { label: "Non disponibles",value: sujets.filter(s => !s.disponible).length, total: sujets.length, color: "var(--amber)" },
      ]} />

      {error   && <Alert type="error"   message={error}   onClose={() => setError(null)}   />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}

      {loading && <LoadingSkeleton rows={3} height={140} />}

      {!loading && sujets.length === 0 && (
        <EmptyState icon={BookOpen}
          title="Aucun sujet"
          description="Vous n'avez pas encore proposé de sujet PFA."
        />
      )}

      {!loading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {sujets.map((s, i) => (
            <SujetCard key={s.id} sujet={s} index={i}
              onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {showForm && (
        <SujetFormModal
          prof={prof}
          sujet={editSujet}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditSujet(null); }}
        />
      )}

      <style>{`@keyframes scaleIn{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}`}</style>
    </div>
  );
}