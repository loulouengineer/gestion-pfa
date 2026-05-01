import { useEffect, useState } from 'react';
import { getRecommandations } from '../api/api';
import { BadgeDifficulte } from './badges';

export default function Recommandations({ etudiant, onSelectionner, choixActuels }) {
  const [recs, setRecs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    getRecommandations(etudiant.id)
      .then((res) => setRecs(res.data))
      .catch(() => setError('Impossible de charger les recommandations.'))
      .finally(() => setLoading(false));
  }, [etudiant.id]);

  const dejaChoisi = (id) => choixActuels.some((c) => c.id === id);
  const maxAtteint = choixActuels.length >= 5;

  if (loading) return <div className="loading-state">Analyse de votre profil…</div>;
  if (error)   return <div className="error-state">{error}</div>;

  return (
    <>
      <div className="recommandation-banner">
        <span className="banner-icon">✦</span>
        <p className="banner-text">
          Recommandations basées sur votre spécialité <strong>{etudiant.specialite}</strong> et
          votre moyenne de <strong>{etudiant.moyenne}/20</strong>.
        </p>
      </div>

      {maxAtteint && (
        <div className="message message-warning">
          Maximum de 5 vœux atteint. Retirez-en un depuis "Mes vœux" pour en ajouter.
        </div>
      )}

      {recs.length === 0 && (
        <div className="empty-recommandations">
          Aucune recommandation disponible pour le moment.
        </div>
      )}

      <div className="recommandations-list">
        {recs.map((rec, index) => {
          const choisi = dejaChoisi(rec.id);

          return (
            <div
              key={rec.id}
              className={`recommandation-card ${index === 0 ? 'top-match' : ''}`}
            >
              {index === 0 && (
                <div className="top-match-badge">Meilleure correspondance</div>
              )}

              <div className="recommandation-content">
                <div className="recommandation-info">
                  <p className="recommandation-title">{rec.titre}</p>
                  {rec.description && (
                    <p className="recommandation-description">
                      {rec.description.length > 120
                        ? rec.description.slice(0, 120) + '…'
                        : rec.description}
                    </p>
                  )}
                  <div className="sujet-badges">
                    <BadgeDifficulte niveau={rec.difficulte} />
                    {rec.scoreAdequation !== undefined && (
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: '3px 10px',
                        borderRadius: 6, background: '#EFF6FF', color: '#1D4ED8',
                      }}>
                        Adéquation {rec.scoreAdequation}%
                      </span>
                    )}
                  </div>
                </div>

                <button
                  className="btn-add"
                  disabled={choisi || maxAtteint}
                  onClick={() => !choisi && !maxAtteint && onSelectionner(rec)}
                >
                  {choisi ? '✓ Ajouté' : '+ Ajouter'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}