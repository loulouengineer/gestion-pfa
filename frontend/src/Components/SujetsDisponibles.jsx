import { useEffect, useState } from 'react';
import { getSujetsDisponibles } from '../api/api';
import { BadgeDifficulte, BadgeDisponible, BadgeTech } from './badges';

export default function SujetsDisponibles({ onSelectionner, choixActuels }) {
  const [sujets, setSujets]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [search, setSearch]     = useState('');
  const [diffFilter, setDiff]   = useState('');
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    getSujetsDisponibles()
      .then((res) => setSujets(res.data))
      .catch(() => setError('Impossible de charger les sujets.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = sujets.filter((s) => {
    const q = search.toLowerCase();
    const matchQ = !q
      || s.titre.toLowerCase().includes(q)
      || s.professeur?.toLowerCase().includes(q)
      || s.technologies?.some((t) => t.toLowerCase().includes(q))
      || s.motsCles?.some((m) => m.toLowerCase().includes(q))
      || s.competences?.some((c) => c.toLowerCase().includes(q));
    const matchD = !diffFilter || s.difficulte == diffFilter;
    return matchQ && matchD;
  });

  const toggle     = (id) => setExpanded((p) => ({ ...p, [id]: !p[id] }));
  const dejaChoisi = (id) => choixActuels.some((c) => c.id === id);
  const maxAtteint = choixActuels.length >= 5;

  if (loading) return <div className="loading-state">Chargement des sujets…</div>;
  if (error)   return <div className="error-state">{error}</div>;

  return (
    <>
      <div className="filters-bar">
        <input
          className="search-input"
          placeholder="Rechercher par titre, professeur, technologie ou mot-clé…"
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
          const choisi = dejaChoisi(sujet.id);
          const isOpen = expanded[sujet.id];

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
                    {sujet.dateProposition && (
                      <span style={{ fontSize: 11, color: '#64748B' }}>
                        📅 {new Date(sujet.dateProposition).toLocaleDateString('fr-FR')}
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

              {/* Panneau de détails — toujours affiché avec fallbacks */}
              {isOpen && (
                <div className="sujet-description">

                  {/* Description */}
                  <div style={{ marginBottom: 12 }}>
                    <strong>📄 Description :</strong>
                    <p style={{ marginTop: 4, color: '#374151' }}>
                      {sujet.description
                        ? sujet.description
                        : <em style={{ color: '#9CA3AF' }}>Aucune description disponible.</em>}
                    </p>
                  </div>

                  {/* Encadrant */}
                  <div style={{ marginBottom: 8 }}>
                    <strong>👤 Encadrant :</strong>{' '}
                    <span style={{ color: '#374151' }}>
                      {sujet.professeur
                        ? sujet.professeur
                        : <em style={{ color: '#9CA3AF' }}>Non assigné</em>}
                    </span>
                  </div>

                  {/* Date de proposition */}
                  <div style={{ marginBottom: 8 }}>
                    <strong>📅 Date de proposition :</strong>{' '}
                    <span style={{ color: '#374151' }}>
                      {sujet.dateProposition
                        ? new Date(sujet.dateProposition).toLocaleDateString('fr-FR')
                        : <em style={{ color: '#9CA3AF' }}>Non renseignée</em>}
                    </span>
                  </div>

                  {/* Difficulté */}
                  <div style={{ marginBottom: 8 }}>
                    <strong>⚡ Difficulté :</strong>{' '}
                    <span style={{ color: '#374151' }}>{sujet.difficulte} / 5</span>
                  </div>

                  {/* Technologies */}
                  <div style={{ marginBottom: 8 }}>
                    <strong>🛠️ Technologies :</strong>
                    {sujet.technologies?.length > 0 ? (
                      <div className="sujet-badges" style={{ marginTop: 4 }}>
                        {sujet.technologies.map((t) => (
                          <span key={t} style={{
                            background: '#DBEAFE', color: '#1D4ED8',
                            borderRadius: 6, padding: '2px 8px', fontSize: 11
                          }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <em style={{ color: '#9CA3AF', marginLeft: 6, fontSize: 12 }}>Non renseignées</em>
                    )}
                  </div>

                  {/* Compétences */}
                  <div style={{ marginBottom: 8 }}>
                    <strong>🎯 Compétences requises :</strong>
                    {sujet.competences?.length > 0 ? (
                      <div className="sujet-badges" style={{ marginTop: 4 }}>
                        {sujet.competences.map((c) => (
                          <span key={c} style={{
                            background: '#EDE9FE', color: '#6D28D9',
                            borderRadius: 6, padding: '2px 8px', fontSize: 11
                          }}>
                            {c}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <em style={{ color: '#9CA3AF', marginLeft: 6, fontSize: 12 }}>Non renseignées</em>
                    )}
                  </div>

                  {/* Mots-clés */}
                  <div style={{ marginBottom: 8 }}>
                    <strong>🏷️ Mots-clés :</strong>
                    {sujet.motsCles?.length > 0 ? (
                      <div className="sujet-badges" style={{ marginTop: 4 }}>
                        {sujet.motsCles.map((m) => (
                          <span key={m} style={{
                            background: '#F0FDF4', color: '#166534',
                            borderRadius: 6, padding: '2px 8px', fontSize: 11
                          }}>
                            {m}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <em style={{ color: '#9CA3AF', marginLeft: 6, fontSize: 12 }}>Non renseignés</em>
                    )}
                  </div>

                  {/* Rang */}
                  <div style={{ fontSize: 12, color: '#64748B' }}>
                    <strong>📊 Rang de popularité :</strong>{' '}
                    {sujet.rang != null
                      ? <strong>#{sujet.rang}</strong>
                      : <em style={{ color: '#9CA3AF' }}>Non classé</em>}
                  </div>

                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}