import { useEffect, useState } from 'react';
import { getChoixEtudiant, soumettreChoix } from '../api/api';
import { BadgeDifficulte, BadgeOrdre } from './badges';

const MAX_CHOIX = 5;

export default function ChoixSujets({
  etudiantId,
  nouveauSujet,
  onChoixChange,
  onChoixSoumis,
}) {
  const [choix, setChoix]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [soumis, setSoumis]   = useState(false);

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  // ✅ Soumettre la liste complète au backend
  const syncBackend = (liste) => {
    if (liste.length === 0) return Promise.resolve();
    return soumettreChoix(etudiantId, liste.map((c) => c.id));
  };

  /* Charger les choix existants */
  useEffect(() => {
    if (!etudiantId) { setLoading(false); return; }
    getChoixEtudiant(etudiantId)
      .then((res) => {
        // ✅ Extraire le sujet de chaque ChoixSujet
        const data = (res.data ?? []).map((c) => c.sujet);
        setChoix(data);
        onChoixChange(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [etudiantId]);

  /* Ajouter un sujet transmis depuis SujetsDisponibles */
  useEffect(() => {
    if (!nouveauSujet || !etudiantId) return;
    if (choix.find((c) => c.id === nouveauSujet.id)) {
      showMessage('Ce sujet est déjà dans vos vœux.', 'warning');
      onChoixSoumis();
      return;
    }
    if (choix.length >= MAX_CHOIX) {
      showMessage(`Maximum ${MAX_CHOIX} vœux atteint.`, 'warning');
      onChoixSoumis();
      return;
    }
    const updated = [...choix, nouveauSujet];
    syncBackend(updated)
      .then(() => {
        setChoix(updated);
        onChoixChange(updated);
        showMessage(`"${nouveauSujet.titre}" ajouté à vos vœux.`, 'success');
      })
      .catch(() => showMessage("Erreur lors de l'ajout.", 'error'))
      .finally(onChoixSoumis);
  }, [nouveauSujet]);

  /* Retirer un sujet */
  const retirer = (sujetId) => {
    const updated = choix.filter((c) => c.id !== sujetId);
    if (updated.length === 0) {
      // ✅ Si liste vide, pas besoin d'appeler le backend
      setChoix([]);
      onChoixChange([]);
      return;
    }
    syncBackend(updated)
      .then(() => {
        setChoix(updated);
        onChoixChange(updated);
      })
      .catch(() => showMessage('Erreur lors de la suppression.', 'error'));
  };

  /* Déplacer un sujet */
  const deplacer = (index, dir) => {
    const j = index + dir;
    if (j < 0 || j >= choix.length) return;
    const updated = [...choix];
    [updated[index], updated[j]] = [updated[j], updated[index]];
    setChoix(updated);
    onChoixChange(updated);
    syncBackend(updated).catch(console.error);
  };

  /* Soumettre */
  const soumettre = () => {
    if (choix.length === 0) return;
    syncBackend(choix)
      .then(() => {
        setSoumis(true);
        showMessage('Vos vœux ont été soumis avec succès !', 'success');
      })
      .catch(() => showMessage('Erreur lors de la soumission.', 'error'));
  };

  if (loading) return <div className="loading-state">Chargement de vos vœux…</div>;

  return (
    <>
      {message && (
        <div className={`message message-${message.type}`}>{message.text}</div>
      )}
      {soumis && (
        <div className="message message-success">
          ✓ Vœux soumis — vous pouvez encore modifier l'ordre avant la clôture.
        </div>
      )}

      <p className="choix-counter">
        {choix.length} vœu{choix.length !== 1 ? 'x' : ''} sur {MAX_CHOIX} maximum
      </p>

      {choix.length === 0 ? (
        <div className="empty-choix">
          Aucun sujet sélectionné.<br />
          Parcourez les sujets ou consultez les recommandations pour remplir votre liste.
        </div>
      ) : (
        <div className="choix-list">
          {choix.map((s, i) => (
            <div key={s.id} className="choix-item">
              <div className="choix-ordre-buttons">
                <button className="ordre-btn" onClick={() => deplacer(i, -1)} disabled={i === 0}>▲</button>
                <button className="ordre-btn" onClick={() => deplacer(i, 1)} disabled={i === choix.length - 1}>▼</button>
              </div>
              <div className="choix-info">
                <p className="choix-titre">{s.titre}</p>
                <div className="choix-badges">
                  <BadgeDifficulte niveau={s.difficulte} />
                  <BadgeOrdre ordre={i + 1} />
                </div>
              </div>
              <button className="btn-retirer" onClick={() => retirer(s.id)}>Retirer</button>
            </div>
          ))}
        </div>
      )}

      <button
        className="btn-soumettre"
        disabled={choix.length === 0}
        onClick={soumettre}
      >
        {soumis
          ? `✓ Vœux soumis (${choix.length})`
          : `Soumettre mes ${choix.length} vœu${choix.length !== 1 ? 'x' : ''}`}
      </button>
    </>
  );
}