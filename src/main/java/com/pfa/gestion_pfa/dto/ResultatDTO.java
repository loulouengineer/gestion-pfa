package com.pfa.gestion_pfa.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResultatDTO {
    private Long id;
    private Double noteGlobale;
    private String mention;
    private String remarques;
    private String salle;
    private String dateHeure;
    private String etudiant1;
    private String etudiant2;
    private String projetTitre;
    private String professeurNom;
}