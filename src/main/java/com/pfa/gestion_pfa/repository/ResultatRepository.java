package com.pfa.gestion_pfa.repository;

import com.pfa.gestion_pfa.model.Resultat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ResultatRepository extends JpaRepository<Resultat, Long> {

    List<Resultat> findByMention(String mention);

    Optional<Resultat> findBySoutenanceId(Long soutenanceId);

    @Query("SELECT AVG(r.noteGlobale) FROM Resultat r")
    Double findMoyenneGenerale();

    @Query("SELECT MAX(r.noteGlobale) FROM Resultat r")
    Double findNoteMax();

    @Query("SELECT MIN(r.noteGlobale) FROM Resultat r")
    Double findNoteMin();
}