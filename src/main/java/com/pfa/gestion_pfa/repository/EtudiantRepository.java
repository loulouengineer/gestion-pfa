package com.pfa.gestion_pfa.repository;

import com.pfa.gestion_pfa.model.Etudiant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EtudiantRepository extends JpaRepository<Etudiant, Long> {

    Optional<Etudiant> findByEmail(String email);

    /** Retourne tous les étudiants triés par moyenne décroissante (pour le classement) */
    List<Etudiant> findAllByOrderByMoyenneDesc();
}
