package tn.enicarthage.projetspring.repository;

//import com.pfa.gestion_pfa.model.ChoixSujet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.enicarthage.projetspring.entity.ChoixSujet;

import java.util.List;

@Repository
public interface ChoixSujetRepository extends JpaRepository<ChoixSujet, Long> {
    List<ChoixSujet> findByBinomeIdOrderByOrdreAsc(Long binomeId);
    void deleteByBinomeId(Long binomeId);
}