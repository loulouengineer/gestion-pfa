package tn.enicarthage.projetspring.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.enicarthage.projetspring.entity.Etudiant;
import java.util.List;
import java.util.Optional;

@Repository
public interface EtudiantRepository extends JpaRepository<Etudiant, Long> {
    Optional<Etudiant> findByEmail(String email);

    boolean existsByEmail(String email);

    List<Etudiant> findAllByOrderByMoyenneDesc();

    List<Etudiant> findByNomContainingIgnoreCaseOrMatriculeContainingIgnoreCase(String nom, String matricule);

    //chayma
    Optional<Etudiant> findByMatricule(String matricule);

    @Query("SELECT e FROM Etudiant e WHERE " +
            "LOWER(e.nom) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
            "LOWER(e.prenom) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
            "LOWER(e.matricule) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
            "LOWER(CONCAT(e.nom, ' ', e.prenom)) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
            "LOWER(CONCAT(e.prenom, ' ', e.nom)) LIKE LOWER(CONCAT('%', :q, '%'))")
    List<Etudiant> rechercherEtudiants(@Param("q") String q);

    @Modifying
    @Query(value = "INSERT INTO etudiant (utilisateur_id, moyenne, matricule, a_un_binome) " +
            "SELECT :userId, 0, :matricule, false " +
            "WHERE NOT EXISTS (SELECT 1 FROM etudiant WHERE utilisateur_id = :userId)",
            nativeQuery = true)
    void creerEtudiantDepuisUser(@Param("userId") Long userId,
                                 @Param("matricule") String matricule);

}
