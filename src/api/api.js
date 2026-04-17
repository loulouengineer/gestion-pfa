import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:8081/api' });

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
export const getBinomeActuel       = (etudiantId) => api.get(`/binomes/par-etudiant/${etudiantId}`); // ✅
export const rechercherEtudiants   = (query) => api.get(`/etudiants/recherche`, { params: { q: query } });
export const formerBinome          = (etudiant1Id, etudiant2Id) => api.post(`/binomes`, { etudiant1Id, etudiant2Id });
export const dissoudreBinome       = (binomeId) => api.delete(`/binomes/${binomeId}`);