package com.pfa.gestion_pfa.dto;

/**
 * DTO pour les recommandations de sujets PFA aux étudiants.
 * Contribution de Wiem — portée dans com.pfa.gestion_pfa.
 */
public class RecommandationDTO {

    private Long sujetId;
    private String titre;
    private String description;
    private double score;
    private Integer rangSujet;
    private String explication;
    private String analyseIA;

    public RecommandationDTO(Long sujetId, String titre, String description,
                              double score, Integer rangSujet,
                              String explication, String analyseIA) {
        this.sujetId = sujetId;
        this.titre = titre;
        this.description = description;
        this.score = score;
        this.rangSujet = rangSujet;
        this.explication = explication;
        this.analyseIA = analyseIA;
    }

    public Long getSujetId()      { return sujetId; }
    public String getTitre()      { return titre; }
    public String getDescription(){ return description; }
    public double getScore()      { return score; }
    public Integer getRangSujet() { return rangSujet; }
    public String getExplication(){ return explication; }
    public String getAnalyseIA()  { return analyseIA; }
}
