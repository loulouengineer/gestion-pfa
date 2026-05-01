package tn.enicarthage.projetspring.dto;


import tn.enicarthage.projetspring.entity.*;

import java.time.LocalDateTime;

public class ResultatMapper {

    public static ResultatDTO toDTO(Resultat r) {
        if (r == null) return null;

        ResultatDTO dto = new ResultatDTO();
        dto.setId(r.getId());
        dto.setNoteGlobale(r.getNoteGlobale());
        dto.setMention(r.getMention());
        dto.setRemarques(r.getRemarques());

        Soutenance s = r.getSoutenance();
        if (s != null) {
            // salle et dateHeure viennent du créneau dans la nouvelle architecture
            if (s.getCreneau() != null) {
                dto.setSalle(s.getCreneau().getSalle());
                dto.setDateHeure(LocalDateTime.of(
                        s.getCreneau().getDate(),
                        s.getCreneau().getHeureDebut()).toString());
            }

            if (s.getSujet() != null)
                dto.setProjetTitre(s.getSujet().getTitre());

            // l'encadrant du sujet = professeur principal du jury
            Professeur encadrant = s.getEncadrant();
            if (encadrant != null)
                dto.setProfesseurNom(encadrant.getNom());

            Binome b = s.getBinome();
            if (b != null) {
                if (b.getEtudiant1() != null)
                    dto.setEtudiant1(b.getEtudiant1().getNom());
                if (b.getEtudiant2() != null)
                    dto.setEtudiant2(b.getEtudiant2().getNom());
            }
        }

        return dto;
    }
}