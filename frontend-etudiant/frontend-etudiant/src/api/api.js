import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:8081/api' });

/* Sujets */
export const getSujetsDisponibles = () => api.get('/sujets/disponibles');
export const getSujetById = (id) => api.get(`/sujets/${id}`);

/* Recommandations */
export const getRecommandations = (etudiantId) => api.get(`/recommandations/${etudiantId}`);

/* Choix / vœux */

export const ajouterChoix = (binomeId, sujetIds) =>
  api.post(`/choix`, { binomeId, sujetIds });

export const getChoixEtudiant = (binomeId) =>
  api.get(`/choix/binome/${binomeId}`);

export const supprimerChoix = (binomeId, sujetId) =>
  api.delete(`/choix/${binomeId}/${sujetId}`);

export const reordonnerChoix = (binomeId, ordreIds) =>
  api.put(`/choix/${binomeId}/ordre`, { ordreIds });

export const soumettreChoix = (binomeId, ordreIds) =>
  api.post(`/choix/${binomeId}/soumettre`, { ordreIds });

/* ── Binôme ── */
export const getBinomeActuel = (etudiantId) => api.get(`/binomes/etudiant/${etudiantId}`);
export const rechercherEtudiants = (query) => api.get(`/etudiants/recherche`, { params: { q: query } });
export const envoyerDemandeBinome = (expediteurId, destinataireId) =>
  api.post(`/binomes/demande`, { expediteurId, destinataireId });
export const getDemandesRecues = (etudiantId) => api.get(`/binomes/demandes/${etudiantId}`);
export const accepterDemandeBinome = (demandeId) => api.put(`/binomes/demande/${demandeId}/accepter`);
export const refuserDemandeBinome = (demandeId) => api.put(`/binomes/demande/${demandeId}/refuser`);
export const dissoudreBinome = (binomeId) => api.delete(`/binomes/${binomeId}`);