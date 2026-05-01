package tn.enicarthage.projetspring.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import tn.enicarthage.projetspring.entity.Professeur;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProfesseurRepository extends JpaRepository<Professeur, Long> {

    Optional<Professeur> findByEmail(String email);

    @Query("SELECT p FROM Professeur p WHERE LOWER(p.nom) LIKE LOWER(CONCAT('%', :nom, '%'))")
    List<Professeur> findByNomContaining(String nom);

    @Query("SELECT p FROM Professeur p JOIN p.creneaux c WHERE c.id = :creneauId")
    List<Professeur> findByCreneauId(Long creneauId);
}
