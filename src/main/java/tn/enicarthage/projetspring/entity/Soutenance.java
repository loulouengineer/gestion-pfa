package tn.enicarthage.projetspring.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

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


    // Date et heure de la soutenance
    private LocalDateTime dateHeure;

    // Salle
    private String salle;

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


    // Lien vers le professeur jury
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "professeur_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Professeur professeur;

    // Lien vers le binôme
    @ManyToOne
    @JoinColumn(name = "binome_id")
    private Binome binome;

    // Lien vers le sujet
    @ManyToOne
    @JoinColumn(name = "sujet_id")
    private Sujet sujet;

}