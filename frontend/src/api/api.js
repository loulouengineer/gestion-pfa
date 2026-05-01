import api from './axios.js';

/* ══════════════════════════════════════════════════
   AUTH
══════════════════════════════════════════════════ */
export const authApi = {
  login:         (email, password)  => api.post('/auth/login',          { email, password }),
  loginEtudiant: (email, password)  => api.post('/auth/login-etudiant', { email, password }),
  register:      (data)             => api.post('/auth/register',        data),
};

/* ══════════════════════════════════════════════════
   SUJETS
══════════════════════════════════════════════════ */
export const getSujetsDisponibles = () => api.get('/sujets/disponibles');
export const getSujetById         = (id) => api.get(`/sujets/${id}`);

export const sujetApi = {
  getAll:         () => api.get('/sujets'),
  getMesSujets:   () => api.get('/sujets/mes-sujets'),
  creer:          (data) => api.post('/sujets', data),
  supprimer:      (id) => api.delete(`/sujets/${id}`),
  changerStatut:  (id, statut) => api.patch(`/sujets/${id}/statut`, null, { params: { statut } }),
  modifier:       (id, data) => api.put(`/sujets/${id}`, data).then(r => r.data),
  getByEncadrant: () => api.get('/sujets/mes-sujets').then(r => r.data),
  getDemandes:    () => api.get('/affectations').then(r =>
    r.data.map(a => ({
      ...a,
      affectationId: a.id,
      binome: a.binome ? {
        ...a.binome,
        etudiant1: a.binome.etudiant1?.nom || "—",
        etudiant2: a.binome.etudiant2?.nom || "—",
        moyenne:   a.binome.moyenneBinome,
      } : null,
      sujet: a.sujet ? {
        ...a.sujet,
        encadrant: a.sujet.encadrant?.nom || "—",
      } : null,
      ordre: null,
    }))
  ),
};

/* ══════════════════════════════════════════════════
   BINÔMES
══════════════════════════════════════════════════ */
export const getBinomeActuel   = (etudiantId) => api.get(`/binomes/etudiant/${etudiantId}`);
export const rechercherEtudiants = (query) => api.get('/etudiants/recherche', { params: { q: query } });
export const formerBinome      = (etudiant1Id, etudiant2Id) => api.post('/binomes', { etudiant1Id, etudiant2Id });
export const dissoudreBinome   = (binomeId) => api.delete(`/binomes/${binomeId}`);

export const binomeApi = {
  getAll:       () => api.get('/binomes'),
  getById:      (id) => api.get(`/binomes/${id}`),
  getParEtudiant: (etudiantId) => api.get(`/binomes/etudiant/${etudiantId}`),
  former:       (etudiant1Id, etudiant2Id) => api.post('/binomes', { etudiant1Id, etudiant2Id }),
};

/* ══════════════════════════════════════════════════
   CHOIX / VŒUX
══════════════════════════════════════════════════ */
export const getChoixEtudiant = (binomeId) => api.get(`/choix/binome/${binomeId}`);
export const soumettreChoix   = (binomeId, sujetIds) => api.post('/choix', { binomeId, sujetIds });
export const supprimerChoix   = (binomeId, sujetId) => api.delete(`/choix/${binomeId}/${sujetId}`);
export const reordonnerChoix  = (binomeId, ordreIds) => api.put(`/choix/${binomeId}/ordre`, { ordreIds });

export const choixSujetApi = {
  soumettre:    (binomeId, sujetIds) => api.post('/choix', { binomeId, sujetIds }),
  getParBinome: (binomeId) => api.get(`/choix/binome/${binomeId}`),
};

/* ══════════════════════════════════════════════════
   RECOMMANDATIONS
══════════════════════════════════════════════════ */
export const getRecommandations = (etudiantId) => api.get(`/recommandations/${etudiantId}`);

export const recommandationApi = {
  getRecommandations: (etudiantId) => api.get(`/recommandations/${etudiantId}`),
};

/* ══════════════════════════════════════════════════
   RÉSULTATS (chaima/wiem)
══════════════════════════════════════════════════ */
export const getAllResultats  = async () => (await api.get('/resultats')).data;
export const getStatistiques = async () => (await api.get('/resultats/statistiques')).data;
export const deleteResultat  = async (id) => (await api.delete(`/resultats/${id}`)).data;

export const exportPDF   = () => window.open('http://localhost:8085/api/resultats/export/pdf',   '_blank');
export const exportExcel = () => window.open('http://localhost:8085/api/resultats/export/excel', '_blank');

/* ══════════════════════════════════════════════════
   SOUTENANCES
══════════════════════════════════════════════════ */
export const soutenanceApi = {
  getAll:              () => api.get('/soutenances').then(r => r.data),
  getPlanningFinal:    () => api.get('/soutenances').then(r => r.data),
  getByProf:           (profId) => api.get(`/soutenances/prof/${profId}`).then(r => r.data),
  getByEtudiant:       (etudiantId) => api.get(`/soutenances/etudiant/${etudiantId}`).then(r => r.data),
  planifier:           (data) => api.post('/soutenances/planifier', data).then(r => r.data),
  planifierAuto:       () => api.post('/soutenances/planifier-auto').then(r => r.data),
  annuler:             (id) => api.delete(`/soutenances/${id}`).then(r => r.data),
  enregistrerResultat: (id, data) => api.put(`/soutenances/${id}/resultat`, data).then(r => r.data),
  notifierDebut:       (id) => api.post(`/notifications/soutenance/${id}/debut`).then(r => r.data),
  notifierFin:         (id, lien) => api.post(`/notifications/soutenance/${id}/fin`, { lienRapport: lien || '' }).then(r => r.data),
};

/* ══════════════════════════════════════════════════
   CRÉNEAUX
══════════════════════════════════════════════════ */
export const creneauApi = {
  getAll:       () => api.get('/creneaux').then(r => r.data),
  creer:        (c) => api.post('/creneaux', c).then(r => r.data),
  modifier:     (id, c) => api.put(`/creneaux/${id}`, c).then(r => r.data),
  supprimer:    (id) => api.delete(`/creneaux/${id}`).then(r => r.data),
  sallesLibres: (date, heureDebut, dureeMinutes) =>
    api.get('/creneaux/salles-libres', { params: { date, heureDebut, dureeMinutes } }).then(r => r.data),
  profsDispos:  (date, heureDebut, heureFin) =>
    api.get('/creneaux/profs-dispos', { params: { date, heureDebut, heureFin } }).then(r => r.data),
};

/* ══════════════════════════════════════════════════
   DISPONIBILITÉS PROF
══════════════════════════════════════════════════ */
export const disponibiliteApi = {
  getByProf:  (profId) => api.get(`/disponibilites/${profId}`).then(r => r.data),
  getSemaine: (profId, date) => api.get(`/disponibilites/${profId}/semaine`, { params: { date } }).then(r => r.data),
  ajouter:    (data) => api.post('/disponibilites', data).then(r => r.data),
  supprimer:  (id) => api.delete(`/disponibilites/${id}`).then(r => r.data),
  modifier:   (id, data) => api.put(`/disponibilites/${id}`, data).then(r => r.data),
};

/* ══════════════════════════════════════════════════
   PROFESSEURS
══════════════════════════════════════════════════ */
export const professeurApi = {
  getAll:             () => api.get('/professeurs').then(r => r.data),
  checkDisponibilite: (id, date) => api.get(`/professeurs/${id}/disponibilite`, { params: { date } }).then(r => r.data),
};

/* ══════════════════════════════════════════════════
   AFFECTATIONS
══════════════════════════════════════════════════ */
export const affectationApi = {
  getAll:           () => api.get('/affectations').then(r => r.data),
  valider:          (id) => api.put(`/affectations/${id}/valider`).then(r => r.data),
  refuser:          (id, commentaire) => api.put(`/affectations/${id}/refuser`, { commentaire }).then(r => r.data),
  lancerAlgorithme: () => api.post('/affectations/lancer').then(r => r.data),
  getByStatut:      (statut) => api.get(`/affectations/statut/${statut}`).then(r => r.data),
};

/* ══════════════════════════════════════════════════
   CHAT
══════════════════════════════════════════════════ */
export const chatApi = {
  getConversation:  (user1, user2) => api.get('/chat/conversation', { params: { user1, user2 } }).then(r => r.data),
  getConversations: (adminId) => api.get('/chat/conversations', { params: { adminId } }).then(r => r.data),
  sendMessage:      (data) => api.post('/chat/send', data).then(r => r.data),
  getUnread:        (userId) => api.get('/chat/unread', { params: { userId } }).then(r => r.data),
};

/* ══════════════════════════════════════════════════
   NOTIFICATIONS
══════════════════════════════════════════════════ */
export const notificationApi = {
  getAll:        (userId) => api.get('/notifications', { params: { userId } }).then(r => r.data),
  getUnreadCount:(userId) => api.get('/notifications/unread-count', { params: { userId } }).then(r => r.data),
  marquerLue:    (id) => api.put(`/notifications/${id}/lire`).then(r => r.data),
  marquerToutes: (userId) => api.put('/notifications/lire-toutes', null, { params: { userId } }).then(r => r.data),
  envoyer:       (data) => api.post('/notifications/envoyer', data).then(r => r.data),
};
