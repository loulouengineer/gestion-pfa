package tn.enicarthage.projetspring.dto;

import java.time.LocalDate;
import java.util.List;

public class SujetDTO {
    public Long id;
    public String titre;
    public String description;
    public int difficulte;
    public boolean disponible;
    public boolean confirme;
    public String statut;
    public String professeur;
    public List<String> technologies;
    public List<String> motsCles;
    public List<String> competences;
    public LocalDate dateProposition;
    public Integer rang;

    public static SujetDTO from(tn.enicarthage.projetspring.entity.Sujet s) {
        SujetDTO dto = new SujetDTO();
        dto.id              = s.getId();
        dto.titre           = s.getTitre();
        dto.description     = s.getDescription();
        dto.difficulte      = s.getDifficulte();
        dto.disponible      = s.isDisponible();
        dto.confirme        = s.isConfirme();
        dto.statut          = s.getStatut() != null ? s.getStatut().name() : "EN_ATTENTE";
        dto.technologies    = s.getTechnologies();
        dto.motsCles        = s.getMotsCles();
        dto.competences     = s.getCompetences();
        dto.dateProposition = s.getDateProposition();
        dto.rang            = s.getRang();
        dto.professeur      = s.getEncadrant() != null
                ? s.getEncadrant().getNom() + " " + s.getEncadrant().getPrenom()
                : null;
        return dto;
    }
}