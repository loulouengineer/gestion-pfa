package tn.enicarthage.projetspring.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.enicarthage.projetspring.entity.Professeur;
import tn.enicarthage.projetspring.entity.Sujet;
import tn.enicarthage.projetspring.entity.StatutSujet;

import java.util.List;

@Repository
public interface SujetRepository extends JpaRepository<Sujet, Long> {

    List<Sujet> findByEncadrant(Professeur encadrant);
    List<Sujet> findByStatut(StatutSujet statut);
    List<Sujet> findByStatutOrderByRangAsc(StatutSujet statut);
    List<Sujet> findByDisponibleTrueAndConfirmeTrue();
    List<Sujet> findByConfirmeTrue();
    List<Sujet> findByEncadrantId(Long professeurId);


}