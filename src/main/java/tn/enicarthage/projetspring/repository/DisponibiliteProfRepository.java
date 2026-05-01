package tn.enicarthage.projetspring.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import tn.enicarthage.projetspring.entity.DisponibiliteProf;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DisponibiliteProfRepository extends JpaRepository<DisponibiliteProf, Long> {

    List<DisponibiliteProf> findByProfesseurId(Long professeurId);

    List<DisponibiliteProf> findByProfesseurIdAndDate(Long professeurId, LocalDate date);

    List<DisponibiliteProf> findByProfesseurIdAndDisponibleTrue(Long professeurId);

    List<DisponibiliteProf> findByProfesseurIdAndDisponibleFalse(Long professeurId);

    @Query("SELECT d FROM DisponibiliteProf d WHERE d.professeur.id IN :profIds")
    List<DisponibiliteProf> findByProfesseurIds(List<Long> profIds);

    void deleteByProfesseurId(Long professeurId);
}
