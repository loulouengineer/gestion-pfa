package tn.enicarthage.projetspring.repository;

//import com.pfa.gestion_pfa.model.Affectation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.enicarthage.projetspring.entity.Affectation;

import java.util.Optional;

@Repository
public interface AffectationRepository extends JpaRepository<Affectation, Long> {
    Optional<Affectation> findByBinomeId(Long binomeId);
}