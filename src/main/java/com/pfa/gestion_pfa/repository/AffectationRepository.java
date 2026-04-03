package com.pfa.gestion_pfa.repository;

import com.pfa.gestion_pfa.model.Affectation;
import com.pfa.gestion_pfa.model.enums.StatutAffectation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AffectationRepository extends JpaRepository<Affectation, Long> {

    /** Toutes les affectations d'un statut donné */
    List<Affectation> findByStatut(StatutAffectation statut);

    /** L'affectation d'un binôme précis */
    Optional<Affectation> findByBinomeId(Long binomeId);

    /** L'affectation pour un sujet précis */
    Optional<Affectation> findBySujetId(Long sujetId);

    /** Affectations non verrouillées (encore modifiables) */
    List<Affectation> findByVerrouilleeFalse();

    /** Affectations verrouillées (validées définitivement) */
    List<Affectation> findByVerrouilleeTrue();

    /** Affectations d'un encadrant donné (via sujet) */
    @Query("SELECT a FROM Affectation a WHERE a.sujet.encadrant.id = :profId")
    List<Affectation> findByEncadrantId(Long profId);

    /** Compte par statut — utile pour les métriques du dashboard */
    long countByStatut(StatutAffectation statut);
}