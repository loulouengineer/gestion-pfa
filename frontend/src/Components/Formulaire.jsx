import React, { useState } from "react";
import api from "../api/axios";
import "./Formulaire.css";

export default function Formulaire({ onSuccess, onClose }) {
  const [formData, setFormData] = useState({
    titre: "",
    description: "",
    motsCles: "",
    competences: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.titre.trim()) newErrors.titre = "Le titre est requis";
    if (!formData.description.trim()) newErrors.description = "La description est requise";
    if (!formData.motsCles.trim()) newErrors.motsCles = "Les mots-clés sont requis";
    if (!formData.competences.trim()) newErrors.competences = "Les compétences sont requises";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.post("/sujets", {
        titre: formData.titre,
        description: formData.description,
        motsCles: formData.motsCles.split(",").map(m => m.trim()).filter(m => m),
        competences: formData.competences.split(",").map(s => s.trim()).filter(s => s),
      });

      onSuccess();
      onClose();
    } catch {
      setError("Erreur lors de la soumission du sujet");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">

        <div className="modal-header">
          <div>
            <h2>Proposer un nouveau sujet PFA</h2>
            <p>Le sujet sera soumis au chef de département pour validation.</p>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <p className="form-error">{error}</p>}

          <FormField
            label="Titre du sujet"
            name="titre"
            value={formData.titre}
            onChange={handleChange}
            error={errors.titre}
            placeholder="Ex: Application mobile de gestion de tâches"
          />

          <FormField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            error={errors.description}
            placeholder="Décrivez le sujet en détail..."
            textarea
          />

          <FormField
            label="Mots-clés (séparés par des virgules)"
            name="motsCles"
            value={formData.motsCles}
            onChange={handleChange}
            error={errors.motsCles}
            placeholder="Ex: Mobile, IA, React Native"
          />

          <FormField
            label="Compétences requises (séparées par des virgules)"
            name="competences"
            value={formData.competences}
            onChange={handleChange}
            error={errors.competences}
            placeholder="Ex: React, Python, TensorFlow"
          />

          <div className="modal-actions">
            <button type="button" onClick={onClose}>Annuler</button>
            <button type="submit" disabled={loading}>
              {loading ? "Envoi..." : "Soumettre"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* Composant réutilisable pour les champs */
function FormField({ label, name, value, onChange, error, placeholder, textarea }) {
  return (
    <div className="form-group">
      <label>{label} <span className="required">*</span></label>
      {textarea ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
      ) : (
        <input
          type="text"
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
      )}
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}