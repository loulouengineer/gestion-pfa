package tn.enicarthage.projetspring.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import tn.enicarthage.projetspring.entity.Affectation;
import tn.enicarthage.projetspring.entity.StatutAffectation;

import java.util.List;
import java.util.Optional;

@Repository
public interface AffectationRepository extends JpaRepository<Affectation, Long> {

    List<Affectation> findByStatut(StatutAffectation statut);

    Optional<Affectation> findByBinomeId(Long binomeId);

    Optional<Affectation> findBySujetId(Long sujetId);

    List<Affectation> findByVerrouilleeFalse();

    List<Affectation> findByVerrouilleeTrue();

    @Query("SELECT a FROM Affectation a WHERE a.sujet.encadrant.id = :profId")
    List<Affectation> findByEncadrantId(Long profId);

    long countByStatut(StatutAffectation statut);
}
