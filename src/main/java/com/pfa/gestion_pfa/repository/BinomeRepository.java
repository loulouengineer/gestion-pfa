package com.pfa.gestion_pfa.repository;

import com.pfa.gestion_pfa.model.Binome;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BinomeRepository extends JpaRepository<Binome, Long> {

    /** Trouve le binôme contenant un étudiant donné */
    Optional<Binome> findByEtudiant1IdOrEtudiant2Id(Long etudiant1Id, Long etudiant2Id);

    /** Vérifie si un étudiant est déjà dans un binôme */
    boolean existsByEtudiant1IdOrEtudiant2Id(Long etudiant1Id, Long etudiant2Id);
}