package com.pfa.gestion_pfa.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Représente les disponibilités d'un professeur pour les soutenances.
 * Phase 2 : Gestion des disponibilités (Chef de département).
 *
 * Règles métier :
 * - Un prof peut définir plusieurs plages de disponibilité
 * - Ces plages sont utilisées pour éviter les conflits lors de la planification
 * - Un prof indisponible ne peut pas être assigné à un jury sur cette plage
 */
@Data
@Entity
@Table(name = "disponibilite_prof")
public class DisponibiliteProf {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Le professeur concerné */
    @ManyToOne
    @JoinColumn(name = "professeur_id", nullable = false)
    private Professeur professeur;

    /**
     * Date spécifique de disponibilité.
     * Si null → disponibilité récurrente (basée sur jourSemaine).
     */
    private LocalDate date;

    /**
     * Jour de la semaine pour les disponibilités récurrentes.
     * Ex : MONDAY, TUESDAY, etc.
     * Ignoré si 'date' est renseignée.
     */
    @Enumerated(EnumType.STRING)
    private DayOfWeek jourSemaine;

    /** Heure de début de la plage de disponibilité */
    @Column(nullable = false)
    private LocalTime heureDebut;

    /** Heure de fin de la plage de disponibilité */
    @Column(nullable = false)
    private LocalTime heureFin;

    /**
     * Indique si c'est une disponibilité (true) ou une indisponibilité (true = dispo).
     * false = le prof est indisponible sur cette plage (ex : réunion, cours).
     */
    @Column(nullable = false)
    private boolean disponible = true;

    // ──────────────────────────────────────────────────────
    // Méthodes métier
    // ──────────────────────────────────────────────────────

    /**
     * Vérifie si le professeur est disponible pour un créneau donné.
     *
     * @param creneau le créneau à vérifier
     * @return true si ce prof est disponible pendant tout le créneau
     */
    public boolean couvre(Creneau creneau) {
        // Vérification de la date ou du jour de semaine
        boolean bonJour;
        if (this.date != null) {
            bonJour = this.date.equals(creneau.getDate());
        } else {
            bonJour = this.jourSemaine != null
                    && this.jourSemaine == creneau.getDate().getDayOfWeek();
        }

        if (!bonJour) return false;

        // Vérification que la plage couvre entièrement le créneau
        boolean heureOk = !this.heureDebut.isAfter(creneau.getHeureDebut())
                && !this.heureFin.isBefore(creneau.getHeureFin());

        return heureOk && this.disponible;
    }

    /**
     * Vérifie si cette disponibilité entre en conflit avec un créneau.
     * Un conflit existe si le prof est INDISPONIBLE (disponible=false)
     * et que la plage chevauche le créneau.
     *
     * @param creneau le créneau à vérifier
     * @return true si conflit (prof indisponible sur ce créneau)
     */
    public boolean estEnConflit(Creneau creneau) {
        if (this.disponible) return false; // Pas de conflit si disponible

        boolean bonJour;
        if (this.date != null) {
            bonJour = this.date.equals(creneau.getDate());
        } else {
            bonJour = this.jourSemaine != null
                    && this.jourSemaine == creneau.getDate().getDayOfWeek();
        }

        if (!bonJour) return false;

        // Chevauchement horaire
        return this.heureDebut.isBefore(creneau.getHeureFin())
                && creneau.getHeureDebut().isBefore(this.heureFin);
    }
}