package com.pfa.gestion_pfa.Repository;

import com.pfa.gestion_pfa.model.Etudiant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface EtudiantRepository extends JpaRepository<Etudiant, Long> {
    Optional<Etudiant> findByMatricule(String matricule);
    Optional<Etudiant> findByEmail(String email);

    // ✅ Recherche par nom, matricule ou spécialité (insensible à la casse)
    @Query("SELECT e FROM Etudiant e WHERE " +
            "LOWER(e.nom) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
            "LOWER(e.matricule) LIKE LOWER(CONCAT('%', :q, '%')) ")
    List<Etudiant> rechercherEtudiants(@Param("q") String q);
}