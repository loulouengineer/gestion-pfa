package com.pfa.gestion_pfa.dto;

import com.pfa.gestion_pfa.model.*;

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
            dto.setSalle(s.getSalle());
            if (s.getDateHeure() != null)
                dto.setDateHeure(s.getDateHeure().toString());

            if (s.getSujet() != null)
                dto.setProjetTitre(s.getSujet().getTitre());

            if (s.getProfesseur() != null)
                dto.setProfesseurNom(s.getProfesseur().getNom());

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