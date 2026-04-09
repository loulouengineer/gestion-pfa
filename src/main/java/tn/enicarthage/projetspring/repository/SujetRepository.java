package tn.enicarthage.projetspring.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.enicarthage.projetspring.entity.Sujet;
import tn.enicarthage.projetspring.entity.StatutSujet;
import tn.enicarthage.projetspring.entity.User;
import java.util.List;

@Repository
public interface SujetRepository extends JpaRepository<Sujet, Long> {
    List<Sujet> findByEnseignant(User enseignant);
    List<Sujet> findByStatut(StatutSujet statut);
    List <Sujet> findByStatutOrderByRangAsc(StatutSujet statut);

}