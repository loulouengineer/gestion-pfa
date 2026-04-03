package com.pfa.gestion_pfa.repository;

import com.pfa.gestion_pfa.model.DisponibiliteProf;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DisponibiliteProfRepository extends JpaRepository<DisponibiliteProf, Long> {

    /** Toutes les disponibilités d'un professeur */
    List<DisponibiliteProf> findByProfesseurId(Long professeurId);

    /** Disponibilités d'un prof sur une date précise */
    List<DisponibiliteProf> findByProfesseurIdAndDate(Long professeurId, LocalDate date);

    /** Uniquement les plages "disponible = true" d'un prof */
    List<DisponibiliteProf> findByProfesseurIdAndDisponibleTrue(Long professeurId);

    /** Uniquement les indisponibilités (cours, réunions) d'un prof */
    List<DisponibiliteProf> findByProfesseurIdAndDisponibleFalse(Long professeurId);

    /**
     * Toutes les disponibilités de plusieurs profs à la fois.
     * Utilisé lors de la vérification globale d'un jury.
     */
    @Query("SELECT d FROM DisponibiliteProf d WHERE d.professeur.id IN :profIds")
    List<DisponibiliteProf> findByProfesseurIds(List<Long> profIds);

    /** Supprime toutes les disponibilités d'un prof — reset du planning */
    void deleteByProfesseurId(Long professeurId);
}