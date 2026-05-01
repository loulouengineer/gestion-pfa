package tn.enicarthage.projetspring.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import tn.enicarthage.projetspring.entity.Creneau;
import tn.enicarthage.projetspring.entity.StatutCreneau;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface CreneauRepository extends JpaRepository<Creneau, Long> {

    List<Creneau> findByStatut(StatutCreneau statut);

    List<Creneau> findBySalle(String salle);

    List<Creneau> findByDate(LocalDate date);

    List<Creneau> findByDateAndStatut(LocalDate date, StatutCreneau statut);

    List<Creneau> findBySalleAndDate(String salle, LocalDate date);

    @Query("SELECT c FROM Creneau c JOIN c.jury j WHERE j.id = :profId")
    List<Creneau> findByJuryId(Long profId);

    long countByStatut(StatutCreneau statut);
}
