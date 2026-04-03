package com.pfa.gestion_pfa.repository;

import com.pfa.gestion_pfa.model.Creneau;
import com.pfa.gestion_pfa.model.enums.StatutCreneau;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface CreneauRepository extends JpaRepository<Creneau, Long> {

    /** Tous les créneaux d'un statut donné (DISPONIBLE / OCCUPE) */
    List<Creneau> findByStatut(StatutCreneau statut);

    /** Tous les créneaux d'une salle — pour détecter les conflits de salle */
    List<Creneau> findBySalle(String salle);

    /** Tous les créneaux d'une date donnée */
    List<Creneau> findByDate(LocalDate date);

    /** Créneaux disponibles d'une date donnée — pour la planification */
    List<Creneau> findByDateAndStatut(LocalDate date, StatutCreneau statut);

    /**
     * Créneaux d'une salle sur une date — pour la vérification des conflits.
     * La logique de chevauchement horaire est gérée dans le service.
     */
    List<Creneau> findBySalleAndDate(String salle, LocalDate date);

    /**
     * Créneaux où un professeur donné est dans le jury.
     * Utilisé pour détecter les conflits de jury.
     */
    @Query("SELECT c FROM Creneau c JOIN c.jury j WHERE j.id = :profId")
    List<Creneau> findByJuryId(Long profId);

    /** Nombre de créneaux disponibles — pour le dashboard */
    long countByStatut(StatutCreneau statut);
}