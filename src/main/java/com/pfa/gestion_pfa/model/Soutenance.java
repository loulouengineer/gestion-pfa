package com.pfa.gestion_pfa.model;

import jakarta.persistence.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "soutenance")
public class Soutenance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Le binôme qui passe en soutenance
    @OneToOne
    @JoinColumn(name = "affectation_id", nullable = false, unique = true)
    private Affectation affectation;

    // Créneau planifié
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creneau_id", nullable = false)
    private Creneau creneau;

    // Jury — encadrant du sujet
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "encadrant_id")
    private Professeur encadrant;

    // Examinateur (second professeur du jury)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "examinateur_id")
    private Professeur examinateur;
}