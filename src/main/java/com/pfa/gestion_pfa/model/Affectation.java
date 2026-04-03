package com.pfa.gestion_pfa.model;

import com.pfa.gestion_pfa.model.enums.StatutAffectation;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Représente l'affectation d'un sujet PFA à un binôme.
 * Phase 1 : Validation finale des sujets par l'admin.
 *
 * Règles métier :
 * - Un binôme → 1 seul sujet affecté
 * - Une fois validée → immuable (verrouillée)
 * - L'admin peut valider, refuser ou modifier avant validation
 */
@Data
@Entity
@Table(name = "affectation")
public class Affectation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Le binôme concerné par cette affectation */
    @OneToOne
    @JoinColumn(name = "binome_id", nullable = false, unique = true)
    private Binome binome;

    /** Le sujet affecté au binôme */
    @ManyToOne
    @JoinColumn(name = "sujet_id", nullable = false)
    private Sujet sujet;

    /**
     * Score calculé par le moteur d'affectation.
     * Basé sur : moyenne du binôme + ordre de préférence du sujet.
     */
    private float score;

    /** Statut courant : EN_ATTENTE, VALIDEE, REFUSEE */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutAffectation statut = StatutAffectation.EN_ATTENTE;

    /** Date et heure de la validation ou du refus par l'admin */
    private LocalDateTime dateDecision;

    /**
     * Raison du refus ou de la modification (optionnel).
     * Renseigné par l'admin en cas de refus ou de changement d'encadrant/sujet.
     */
    private String commentaireAdmin;

    /**
     * Indique si l'affectation est verrouillée (après validation définitive).
     * Une affectation verrouillée ne peut plus être modifiée.
     */
    @Column(nullable = false)
    private boolean verrouillee = false;

    // ──────────────────────────────────────────────────────
    // Méthodes métier
    // ──────────────────────────────────────────────────────

    /**
     * Valide l'affectation et la verrouille.
     * @throws IllegalStateException si déjà verrouillée
     */
    public void valider() {
        if (verrouillee) {
            throw new IllegalStateException("L'affectation est déjà verrouillée et ne peut plus être modifiée.");
        }
        this.statut = StatutAffectation.VALIDEE;
        this.verrouillee = true;
        this.dateDecision = LocalDateTime.now();
    }

    /**
     * Refuse l'affectation avec un commentaire explicatif.
     * @param commentaire raison du refus
     * @throws IllegalStateException si déjà verrouillée
     */
    public void refuser(String commentaire) {
        if (verrouillee) {
            throw new IllegalStateException("L'affectation est verrouillée et ne peut plus être modifiée.");
        }
        this.statut = StatutAffectation.REFUSEE;
        this.commentaireAdmin = commentaire;
        this.dateDecision = LocalDateTime.now();
    }

    /**
     * Modifie le sujet ou l'encadrant avant validation.
     * @param nouveauSujet le nouveau sujet à affecter
     * @param commentaire  raison de la modification
     * @throws IllegalStateException si déjà verrouillée
     */
    public void modifier(Sujet nouveauSujet, String commentaire) {
        if (verrouillee) {
            throw new IllegalStateException("L'affectation est verrouillée et ne peut plus être modifiée.");
        }
        this.sujet = nouveauSujet;
        this.commentaireAdmin = commentaire;
    }
}