package com.pfa.gestion_pfa.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "notes_criteres")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NoteParCritere {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "resultat_id")
    private Resultat resultat;

    // Nom du critère : "Présentation orale", "Rapport écrit", etc.
    private String critere;

    // Note sur 20
    private Double note;
}