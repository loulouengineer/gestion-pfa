import api from './axios.js';

/* Sujets */
export const getSujetsDisponibles  = () => api.get('/sujets/disponibles');
export const getSujetById          = (id) => api.get(`/sujets/${id}`);

/* Recommandations */
export const getRecommandations    = (etudiantId) => api.get(`/recommandations/${etudiantId}`);

/* Choix / vœux */
export const getChoixEtudiant      = (binomeId) => api.get(`/choix/binome/${binomeId}`);
export const soumettreChoix        = (binomeId, sujetIds) => api.post(`/choix`, { binomeId, sujetIds });
export const supprimerChoix        = (binomeId, sujetId) => api.delete(`/choix/${binomeId}/${sujetId}`);
export const reordonnerChoix       = (binomeId, ordreIds) => api.put(`/choix/${binomeId}/ordre`, { ordreIds });

/* Binôme */
// Dans api.js — utilise l'URL qui existe déjà
export const getBinomeActuel = (etudiantId) => api.get(`/binomes/etudiant/${etudiantId}`);
export const rechercherEtudiants   = (query) => api.get(`/etudiants/recherche`, { params: { q: query } });
export const formerBinome          = (etudiant1Id, etudiant2Id) => api.post(`/binomes`, { etudiant1Id, etudiant2Id });
export const dissoudreBinome       = (binomeId) => api.delete(`/binomes/${binomeId}`);


/* Résultats */
export const getAllResultats  = async () => (await api.get('/resultats')).data;
export const getStatistiques = async () => (await api.get('/resultats/statistiques')).data;
export const deleteResultat  = async (id) => (await api.delete(`/resultats/${id}`)).data;

export const exportPDF = () =>
  window.open('http://localhost:8085/api/resultats/export/pdf', '_blank');
export const exportExcel = () =>
  window.open('http://localhost:8085/api/resultats/export/excel', '_blank');