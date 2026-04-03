const BASE_URL = "http://localhost:8081/api";

async function request(method, path, body = null) {
  const options = { method, headers: { "Content-Type": "application/json" } };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(`${BASE_URL}${path}`, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.erreur || `Erreur ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const affectationApi = {
  getAll:        ()                         => request("GET",  "/affectations"),
  valider:       (id)                       => request("PUT",  `/affectations/${id}/valider`),
  refuser:       (id, commentaire)          => request("PUT",  `/affectations/${id}/refuser`, { commentaire }),
  modifier:      (id, sujetId, commentaire) => request("PUT",  `/affectations/${id}/modifier`, { sujetId, commentaire }),
  validerToutes: ()                         => request("PUT",  "/affectations/valider-toutes"),
};

export const creneauApi = {
  getAll:  () => request("GET",  "/creneaux"),
  creer:   (c) => request("POST", "/creneaux", c),
};

export const disponibiliteApi = {
  getParProf:  (id)  => request("GET",  `/disponibilites/${id}`),
  enregistrer: (d)   => request("POST", "/disponibilites", d),
};

export const professeurApi = {
  getAll:             ()           => request("GET", "/professeurs"),
  search:             (nom)        => request("GET", `/professeurs/search?nom=${encodeURIComponent(nom)}`),
  checkDisponibilite: (id, date)   => request("GET", `/professeurs/${id}/disponibilite?date=${date}`),
};

export const soutenanceApi = {
  getPlanningFinal:    ()         => request("GET",  "/soutenances"),
  getPlanningParDate:  (date)     => request("GET",  `/soutenances?date=${date}`),
  planifier:           (data)     => request("POST", "/soutenances/planifier", data),
  planifierAuto:       ()         => request("POST", "/soutenances/planifier-auto"),
  enregistrerResultat: (id, data) => request("PUT",  `/soutenances/${id}/resultat`, data),
};