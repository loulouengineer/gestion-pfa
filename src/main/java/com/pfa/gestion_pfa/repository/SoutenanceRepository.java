package com.pfa.gestion_pfa.repository;

import com.pfa.gestion_pfa.model.Binome;
import com.pfa.gestion_pfa.model.Professeur;
import com.pfa.gestion_pfa.model.Soutenance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SoutenanceRepository extends JpaRepository<Soutenance, Long> {

    boolean existsByBinome(Binome binome);

    List<Soutenance> findByJuryContaining(Professeur professeur);

    @Query("SELECT s FROM Soutenance s ORDER BY s.creneau.date ASC, s.creneau.heureDebut ASC")
    List<Soutenance> findAllOrderByDateAndHeure();

    @Query("SELECT s FROM Soutenance s JOIN s.creneau c JOIN c.jury j WHERE j.id = :profId ORDER BY c.date ASC, c.heureDebut ASC")
    List<Soutenance> findByJuryProfId(Long profId);

    @Query("SELECT s FROM Soutenance s WHERE s.creneau.date = :date")
    List<Soutenance> findByCreneauDate(java.time.LocalDate date);
}