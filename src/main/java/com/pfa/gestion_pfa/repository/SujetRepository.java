package com.pfa.gestion_pfa.repository;

import com.pfa.gestion_pfa.model.Sujet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SujetRepository extends JpaRepository<Sujet, Long> {

    /** Tous les sujets disponibles */
    List<Sujet> findByDisponibleTrue();

    /** Sujets d'un encadrant donné */
    List<Sujet> findByEncadrantId(Long profId);
}