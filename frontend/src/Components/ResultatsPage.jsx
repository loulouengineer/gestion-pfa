import { useState, useEffect } from "react";
import TableauResultats from "./TableauResultats";
import StatistiquesCards from "./StatistiquesCards";
import GraphiquesPage from "./GraphiquesPage";
import { getAllResultats, getStatistiques, deleteResultat } from "../api/api";

export default function ResultatsPage() {
  const [resultats, setResultats] = useState([]);
  const [statistiques, setStatistiques] = useState({});
  const [filtresMention, setFiltresMention] = useState("");
  const [recherche, setRecherche] = useState("");
  const [ongletActif, setOngletActif] = useState("tableau");
  const [loading, setLoading] = useState(true);

  useEffect(() => { chargerDonnees(); }, []);

  const chargerDonnees = async () => {
    try {
      setLoading(true);
      const [dataResultats, dataStats] = await Promise.all([
        getAllResultats(),
        getStatistiques(),
      ]);
      setResultats(dataResultats);
      setStatistiques(dataStats);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const resultatsFiltres = resultats.filter((r) => {
    const matchMention = filtresMention === "" || r.mention === filtresMention;
    const searchLower = recherche.toLowerCase();
    const matchRecherche =
      recherche === "" ||
      (r.etudiant1 && r.etudiant1.toLowerCase().includes(searchLower)) ||
      (r.etudiant2 && r.etudiant2.toLowerCase().includes(searchLower)) ||
      (r.projetTitre && r.projetTitre.toLowerCase().includes(searchLower));
    return matchMention && matchRecherche;
  });

  const handleDelete = async (id) => {
    if (window.confirm("Supprimer ce résultat ?")) {
      await deleteResultat(id);
      chargerDonnees();
    }
  };

  if (loading) return (
    <div style={styles.loading}>
      <div style={styles.spinner} />
      <p>Chargement...</p>
    </div>
  );

  return (
    <div style={styles.page}>

      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <div style={styles.phase}>PHASE 4</div>
          <h1 style={styles.titre}>Résultats des Soutenances</h1>
        </div>
      </div>

      {/* STATS */}
      <StatistiquesCards
        statistiques={statistiques}
        total={resultats.length}
      />

      {/* ONGLETS */}
      <div style={styles.onglets}>
        <button
          style={ongletActif === "tableau" ? styles.ongletActif : styles.onglet}
          onClick={() => setOngletActif("tableau")}
        >
          Tableau des résultats
        </button>
        <button
          style={ongletActif === "graphiques" ? styles.ongletActif : styles.onglet}
          onClick={() => setOngletActif("graphiques")}
        >
          Graphiques & Analyses
        </button>
      </div>

      {/* FILTRES */}
      {ongletActif === "tableau" && (
        <div style={styles.filtres}>
          <input
            style={styles.input}
            placeholder="Rechercher étudiant ou projet..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
          />
          <select
            style={styles.select}
            value={filtresMention}
            onChange={(e) => setFiltresMention(e.target.value)}
          >
            <option value="">Toutes les mentions</option>
            <option value="Excellent">Excellent</option>
            <option value="Très bien">Très bien</option>
            <option value="Bien">Bien</option>
            <option value="Moyen">Moyen</option>
          </select>
          <span style={styles.compteur}>
            {resultatsFiltres.length} résultat{resultatsFiltres.length > 1 ? "s" : ""}
          </span>
        </div>
      )}

      {/* CONTENU */}
      {ongletActif === "tableau" ? (
        <TableauResultats
          resultats={resultatsFiltres}
          onDelete={handleDelete}
          onRefresh={chargerDonnees}
        />
      ) : (
        <GraphiquesPage resultats={resultats} />
      )}
    </div>
  );
}

const styles = {
  page: {
    padding: "32px 36px",
    minHeight: "100vh",
    backgroundColor: "#f8f9fb",
  },
  header: {
    marginBottom: "28px",
  },
  phase: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#6b7280",
    letterSpacing: "1px",
    marginBottom: "6px",
  },
  titre: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#08060d",
    margin: 0,
  },
  onglets: {
    display: "flex",
    gap: "0",
    marginBottom: "20px",
    borderBottom: "2px solid #e5e4e7",
  },
  onglet: {
    padding: "10px 20px",
    border: "none",
    borderBottom: "2px solid transparent",
    backgroundColor: "transparent",
    color: "#6b7280",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    marginBottom: "-2px",
  },
  ongletActif: {
    padding: "10px 20px",
    border: "none",
    borderBottom: "2px solid #4361ee",
    backgroundColor: "transparent",
    color: "#4361ee",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    marginBottom: "-2px",
  },
  filtres: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    marginBottom: "20px",
    flexWrap: "wrap",
  },
  input: {
    padding: "9px 14px",
    borderRadius: "8px",
    border: "1px solid #e5e4e7",
    fontSize: "14px",
    width: "280px",
    outline: "none",
    backgroundColor: "#fff",
    color: "#08060d",
  },
  select: {
    padding: "9px 14px",
    borderRadius: "8px",
    border: "1px solid #e5e4e7",
    fontSize: "14px",
    outline: "none",
    backgroundColor: "#fff",
    color: "#08060d",
    cursor: "pointer",
  },
  compteur: {
    fontSize: "13px",
    color: "#6b7280",
    marginLeft: "auto",
  },
  loading: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    gap: "16px",
    color: "#6b7280",
  },
  spinner: {
    width: "36px",
    height: "36px",
    border: "3px solid #e5e4e7",
    borderTop: "3px solid #4361ee",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
};