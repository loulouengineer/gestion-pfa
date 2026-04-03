package com.pfa.gestion_pfa.repository;

import com.pfa.gestion_pfa.model.Professeur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProfesseurRepository extends JpaRepository<Professeur, Long> {

    /** Recherche par nom (insensible à la casse, contient) */
    @Query("SELECT p FROM Professeur p WHERE LOWER(p.nom) LIKE LOWER(CONCAT('%', :nom, '%'))")
    List<Professeur> findByNomContaining(String nom);
}