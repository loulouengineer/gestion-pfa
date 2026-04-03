package com.pfa.gestion_pfa.repository;

import com.pfa.gestion_pfa.model.Binome;
import com.pfa.gestion_pfa.model.Professeur;
import com.pfa.gestion_pfa.model.Soutenance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface SoutenanceRepository extends JpaRepository<Soutenance, Long> {

    /** La soutenance d'un binôme précis */
    Optional<Soutenance> findByBinome(Binome binome);

    /** Vérifie si un binôme a déjà une soutenance planifiée */
    boolean existsByBinome(Binome binome);

    /** Toutes les soutenances d'une date donnée — vue journalière */
    List<Soutenance> findByCreneauDate(LocalDate date);

    /**
     * Soutenances où un prof donné est dans le jury.
     * Utilisé pour détecter les conflits de jury à la planification.
     */
    @Query("SELECT s FROM Soutenance s JOIN s.jury j WHERE j = :prof")
    List<Soutenance> findByJuryContaining(Professeur prof);

    /** Soutenances d'un prof en tant qu'encadrant (via affectation → sujet) */
    @Query("SELECT s FROM Soutenance s WHERE s.affectation.sujet.encadrant.id = :profId")
    List<Soutenance> findByEncadrantId(Long profId);

    /** Soutenances par statut */
    List<Soutenance> findByStatut(Soutenance.StatutSoutenance statut);

    /** Soutenances dans une salle donnée */
    @Query("SELECT s FROM Soutenance s WHERE s.creneau.salle = :salle")
    List<Soutenance> findBySalle(String salle);

    /** Nombre de soutenances par statut — métriques dashboard */
    long countByStatut(Soutenance.StatutSoutenance statut);

    /**
     * Planning complet trié par date puis heure de début.
     * Utilisé pour l'affichage Phase 4.
     */
    @Query("SELECT s FROM Soutenance s ORDER BY s.creneau.date ASC, s.creneau.heureDebut ASC")
    List<Soutenance> findAllOrderByDateAndHeure();
}