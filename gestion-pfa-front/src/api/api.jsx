const BASE_URL = "http://localhost:8081/api";

async function request(method, path, body = null) {
  const options = { method, headers: { "Content-Type": "application/json" } };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(`${BASE_URL}${path}`, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.erreur || `Erreur ${res.status}`);
  }
  const text = await res.text();
  if (!text || text.trim() === "") return null;
  try { return JSON.parse(text); } catch { return null; }
}

export const authApi = {
  login: (email, motDePasse) => request("POST", "/auth/login", { email, motDePasse }),
  me:    (id)                => request("GET",  `/auth/me?id=${id}`),
};

export const creneauApi = {
  getAll:       ()                               => request("GET",    "/creneaux"),
  creer:        (c)                              => request("POST",   "/creneaux", c),
  modifier:     (id, c)                          => request("PUT",    `/creneaux/${id}`, c),
  supprimer:    (id)                             => request("DELETE", `/creneaux/${id}`),
  sallesLibres: (date, heureDebut, dureeMinutes) =>
    request("GET", `/creneaux/salles-libres?date=${date}&heureDebut=${heureDebut}&dureeMinutes=${dureeMinutes}`),
  profsDispos:  (date, heureDebut, heureFin)     =>
    request("GET", `/creneaux/profs-dispos?date=${date}&heureDebut=${heureDebut}&heureFin=${heureFin}`),
};

export const professeurApi = {
  getAll:             ()         => request("GET", "/professeurs"),
  checkDisponibilite: (id, date) => request("GET", `/professeurs/${id}/disponibilite?date=${date}`),
};

export const disponibiliteApi = {
  getByProf:  (profId)       => request("GET",    `/disponibilites/${profId}`),
  getSemaine: (profId, date) => request("GET",    `/disponibilites/${profId}/semaine?date=${date}`),
  ajouter:    (data)         => request("POST",   "/disponibilites", data),
  supprimer:  (id)           => request("DELETE", `/disponibilites/${id}`),
  modifier:   (id, data)     => request("PUT",    `/disponibilites/${id}`, data),
};

export const sujetApi = {
  getAll:         ()         => request("GET",    "/sujets"),
  getByEncadrant: (profId)   => request("GET",    `/sujets/encadrant/${profId}`),
  creer:          (data)     => request("POST",   "/sujets", data),
  modifier:       (id, data) => request("PUT",    `/sujets/${id}`, data),
  supprimer:      (id)       => request("DELETE", `/sujets/${id}`),
  getByEncadrant: (profId) => request("GET", `/sujets/encadrant/${profId}`),
  getDemandes:    ()       => request("GET", "/sujets/demandes"),
};

export const affectationApi = {
  getAll:        ()                => request("GET", "/affectations"),
  valider:       (id)              => request("PUT", `/affectations/${id}/valider`),
  refuser:       (id, commentaire) => request("PUT", `/affectations/${id}/refuser`, { commentaire }),
  validerToutes: ()                => request("PUT", "/affectations/valider-toutes"),
};

export const soutenanceApi = {
  getAll:              ()         => request("GET",    "/soutenances"),
  getPlanningFinal:    ()         => request("GET",    "/soutenances"),
  getByProf:           (profId)   => request("GET",    `/soutenances/prof/${profId}`),
  planifier:           (data)     => request("POST",   "/soutenances/planifier", data),
  planifierAuto:       ()         => request("POST",   "/soutenances/planifier-auto"),
  annuler:             (id)       => request("DELETE", `/soutenances/${id}`),
  enregistrerResultat: (id, data) => request("PUT",    `/soutenances/${id}/resultat`, data),
  notifierDebut:       (id)       => request("POST",   `/notifications/soutenance/${id}/debut`),
  notifierFin:         (id, lien) => request("POST",   `/notifications/soutenance/${id}/fin`, { lienRapport: lien || "" }),
};

export const chatApi = {
  getConversation:  (user1, user2) => request("GET",  `/chat/conversation?user1=${user1}&user2=${user2}`),
  getConversations: (adminId)      => request("GET",  `/chat/conversations?adminId=${adminId}`),
  sendMessage:      (data)         => request("POST", "/chat/send", data),
  getUnread:        (userId)       => request("GET",  `/chat/unread?userId=${userId}`),
};

export const notificationApi = {
  getAll:         (userId) => request("GET", `/notifications?userId=${userId}`),
  getUnreadCount: (userId) => request("GET", `/notifications/unread-count?userId=${userId}`),
  marquerLue:     (id)     => request("PUT", `/notifications/${id}/lire`),
  marquerToutes:  (userId) => request("PUT", `/notifications/lire-toutes?userId=${userId}`),
  envoyer:        (data)   => request("POST", "/notifications/envoyer", data),
};