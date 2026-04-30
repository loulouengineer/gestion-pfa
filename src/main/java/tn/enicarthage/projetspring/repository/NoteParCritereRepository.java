package tn.enicarthage.projetspring.repository;

import tn.enicarthage.projetspring.entity.NoteParCritere;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NoteParCritereRepository extends JpaRepository<NoteParCritere, Long> {
    List<NoteParCritere> findByResultatId(Long resultatId);
}