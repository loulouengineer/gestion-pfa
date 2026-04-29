package com.pfa.gestion_pfa.repository;

import com.pfa.gestion_pfa.model.NoteParCritere;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NoteParCritereRepository extends JpaRepository<NoteParCritere, Long> {
    List<NoteParCritere> findByResultatId(Long resultatId);
}