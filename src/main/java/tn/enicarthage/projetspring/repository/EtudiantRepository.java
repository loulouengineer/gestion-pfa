package tn.enicarthage.projetspring.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.enicarthage.projetspring.entity.Etudiant;
import java.util.List;
import java.util.Optional;

@Repository
public interface EtudiantRepository extends JpaRepository<Etudiant, Long> {
    Optional<Etudiant> findByEmail(String email);
    boolean existsByEmail(String email);
    List<Etudiant> findAllByOrderByMoyenneDesc();
}