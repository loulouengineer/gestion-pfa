package tn.enicarthage.projetspring.dto;

import java.util.List;

public class SujetRequest {
    private String titre;
    private String description;
    private List<String> motsCles;
    private List<String> competences;
    private Integer rang;
    private Integer difficulte;
    private Boolean disponible;

    public Integer getRang() {return rang; }
    public void setRang(Integer rang) { this.rang = rang; }

    public Integer getDifficulte() { return difficulte; }
    public void setDifficulte(Integer difficulte) { this.difficulte = difficulte; }

    public Boolean getDisponible() { return disponible; }
    public void setDisponible(Boolean disponible) { this.disponible = disponible; }


    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public List<String> getMotsCles() { return motsCles; }
    public void setMotsCles(List<String> motsCles) { this.motsCles = motsCles; }

    public List<String> getCompetences() { return competences; }
    public void setCompetences(List<String> competences) { this.competences = competences; }
}