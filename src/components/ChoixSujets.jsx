import { useEffect, useState, useRef } from 'react';
import { getBinomeActuel, getChoixEtudiant, soumettreChoix } from '../api/api';
import { BadgeDifficulte, BadgeOrdre } from './badges';

const MAX_CHOIX = 5;

export default function ChoixSujets({
  etudiantId,
  nouveauSujet,
  onChoixChange,
  onChoixSoumis,
}) {
  const [choix, setChoix]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [message, setMessage]     = useState(null);
  const [soumis, setSoumis]       = useState(false);

  const choixRef      = useRef([]);
  const binomeRef     = useRef(null);
  const pendingSujet  = useRef(null); // ✅ sujet en attente si binôme pas encore chargé

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const updateChoix = (data) => {
    choixRef.current = data;
    setChoix(data);
    onChoixChange(data);
  };

  const syncBackend = (liste) => {
    const bId = binomeRef.current;
    if (!bId) return Promise.reject(new Error('binomeId non disponible'));
    return soumettreChoix(bId, liste.map((c) => c.id));
  };

  const ajouterSujet = (sujet) => {
    const courant = choixRef.current;
    console.log('binomeRef:', binomeRef.current);  // ✅
    console.log('sujet:', sujet);                   // ✅
    console.log('choix actuels:', choixRef.current); 

    if (courant.find((c) => c.id === sujet.id)) {
      showMessage('Ce sujet est déjà dans vos vœux.', 'warning');
      onChoixSoumis();
      return;
    }
    if (courant.length >= MAX_CHOIX) {
      showMessage(`Maximum ${MAX_CHOIX} vœux atteint.`, 'warning');
      onChoixSoumis();
      return;
    }

    const updated = [...courant, sujet];

    syncBackend(updated)
      .then(() => {
        updateChoix(updated);
        showMessage(`"${sujet.titre}" ajouté à vos vœux.`, 'success');
      })
      .catch(() => showMessage("Erreur lors de l'ajout.", 'error'))
      .finally(onChoixSoumis);
  };

  /* 1. Charger le binôme puis les choix */
  useEffect(() => {
    if (!etudiantId) { setLoading(false); return; }

    getBinomeActuel(etudiantId)
      .then((res) => {
        const bId = res.data?.id;
        if (!bId) throw new Error('Aucun binôme trouvé');

        binomeRef.current = bId;
        return getChoixEtudiant(bId);
      })
      .then((res) => {
        const data = (res.data ?? []).map((c) => c.sujet);
        updateChoix(data);

        // ✅ traiter le sujet en attente si arrivé avant la fin du chargement
        if (pendingSujet.current) {
          const sujet = pendingSujet.current;
          pendingSujet.current = null;
          ajouterSujet(sujet);
        }
      })
      .catch((err) => {
        console.error(err);
        showMessage('Impossible de charger vos vœux.', 'error');
      })
      .finally(() => setLoading(false));
  }, [etudiantId]);

  /* 2. Ajouter un nouveau sujet */
  useEffect(() => {
    if (!nouveauSujet) return;

    if (!binomeRef.current) {
      // ✅ binôme pas encore chargé → mettre en attente
      pendingSujet.current = nouveauSujet;
      return;
    }

    ajouterSujet(nouveauSujet);
  }, [nouveauSujet]);

  const retirer = (sujetId) => {
    const updated = choixRef.current.filter((c) => c.id !== sujetId);
    const sync = updated.length === 0
      ? soumettreChoix(binomeRef.current, [])
      : syncBackend(updated);

    sync
      .then(() => updateChoix(updated))
      .catch(() => showMessage('Erreur lors de la suppression.', 'error'));
  };

  const deplacer = (index, dir) => {
    const j = index + dir;
    if (j < 0 || j >= choixRef.current.length) return;
    const updated = [...choixRef.current];
    [updated[index], updated[j]] = [updated[j], updated[index]];
    updateChoix(updated);
    syncBackend(updated).catch(console.error);
  };

  const soumettre = () => {
    if (choixRef.current.length === 0) return;
    syncBackend(choixRef.current)
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