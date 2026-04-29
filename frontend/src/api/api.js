import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8081/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const getAllResultats = async () => {
  const res = await api.get("/resultats");
  return res.data;
};

export const getStatistiques = async () => {
  const res = await api.get("/resultats/statistiques");
  return res.data;
};

export const deleteResultat = async (id) => {
  const res = await api.delete(`/resultats/${id}`);
  return res.data;
};

export const exportPDF = () => {
  window.open("http://localhost:8081/api/resultats/export/pdf", "_blank");
};

export const exportExcel = () => {
  window.open("http://localhost:8081/api/resultats/export/excel", "_blank");
};

export default api;
