import { useEffect, useState } from 'react';
import { getSujetsDisponibles } from '../api/api';
import { BadgeDifficulte, BadgeDisponible, BadgeTech } from './badges';

export default function SujetsDisponibles({ onSelectionner, choixActuels }) {
  const [sujets, setSujets]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [search, setSearch]       = useState('');
  const [diffFilter, setDiff]     = useState('');
  const [expanded, setExpanded]   = useState({});

  useEffect(() => {
    getSujetsDisponibles()
      .then((res) => setSujets(res.data))
      .catch(() => setError('Impossible de charger les sujets.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = sujets.filter((s) => {
    const q = search.toLowerCase();
    const matchQ = !q || s.titre.toLowerCase().includes(q)
                      || s.professeur?.toLowerCase().includes(q)
                      || s.technologies?.some((t) => t.toLowerCase().includes(q));
    const matchD = !diffFilter || s.difficulte == diffFilter;
    return matchQ && matchD;
  });

  const toggle = (id) => setExpanded((p) => ({ ...p, [id]: !p[id] }));
  const dejaChoisi = (id) => choixActuels.some((c) => c.id === id);
  const maxAtteint = choixActuels.length >= 5;

  if (loading) return <div className="loading-state">Chargement des sujets…</div>;
  if (error)   return <div className="error-state">{error}</div>;

  return (
    <>
      <div className="filters-bar">
        <input
          className="search-input"
          placeholder="Rechercher par titre, professeur ou technologie…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="difficulty-select"
          value={diffFilter}
          onChange={(e) => setDiff(e.target.value)}
        >
          <option value="">Toutes les difficultés</option>
          <option value="1">Facile (1–2)</option>
          <option value="3">Moyen (3)</option>
          <option value="4">Difficile (4–5)</option>
        </select>
      </div>

      {maxAtteint && (
        <div className="message message-warning">
          Vous avez atteint le maximum de 5 vœux. Retirez-en un depuis l'onglet "Mes vœux" pour en ajouter un autre.
        </div>
      )}

      {filtered.length === 0 && (
        <div className="empty-sujets">Aucun sujet ne correspond à votre recherche.</div>
      )}

      <div className="sujets-list">
        {filtered.map((sujet) => {
          const choisi  = dejaChoisi(sujet.id);
          const isOpen  = expanded[sujet.id];

          return (
            <div key={sujet.id} className="sujet-card">
              <div className="sujet-card-header">
                <div className="sujet-info">
                  <p className="sujet-titre">{sujet.titre}</p>
                  <div className="sujet-badges">
                    <BadgeDifficulte niveau={sujet.difficulte} />
                    <BadgeDisponible disponible={sujet.disponible} />
                    {sujet.professeur && (
                      <span style={{ fontSize: 11, color: '#64748B' }}>
                        👤 {sujet.professeur}
                      </span>
                    )}
                  </div>
                  {sujet.technologies?.length > 0 && (
                    <div className="sujet-badges" style={{ marginTop: 6 }}>
                      {sujet.technologies.map((t) => (
                        <BadgeTech key={t} tech={t} />
                      ))}
                    </div>
                  )}
                </div>

                <div className="sujet-actions">
                  <button className="btn-details" onClick={() => toggle(sujet.id)}>
                    {isOpen ? 'Masquer' : 'Détails'}
                  </button>

                  {sujet.disponible ? (
                    <button
                      className="btn-choisir"
                      disabled={choisi || maxAtteint}
                      onClick={() => !choisi && !maxAtteint && onSelectionner(sujet)}
                    >
                      {choisi ? '✓ Ajouté' : 'Choisir'}
                    </button>
                  ) : (
                    <button className="btn-details" disabled>Non disponible</button>
                  )}
                </div>
              </div>

              {isOpen && sujet.description && (
                <div className="sujet-description">{sujet.description}</div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}