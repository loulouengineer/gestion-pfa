package com.pfa.gestion_pfa.repository;

import com.pfa.gestion_pfa.model.ChoixSujet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChoixSujetRepository extends JpaRepository<ChoixSujet, Long> {

    /** Tous les choix d'un binôme, triés par ordre de préférence */
    List<ChoixSujet> findByBinomeIdOrderByOrdreAsc(Long binomeId);

    /** Tous les binômes ayant choisi un sujet donné */
    List<ChoixSujet> findBySujetId(Long sujetId);

    /** Nombre de choix d'un binôme — max 5 autorisés */
    long countByBinomeId(Long binomeId);

    /** Vérifie si un binôme a déjà choisi un sujet précis */
    boolean existsByBinomeIdAndSujetId(Long binomeId, Long sujetId);

    /** Supprime tous les choix d'un binôme (reset) */
    void deleteByBinomeId(Long binomeId);
}