package com.pfa.gestion_pfa.Repository;

import com.pfa.gestion_pfa.model.Affectation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface AffectationRepository extends JpaRepository<Affectation, Long> {
    Optional<Affectation> findByBinomeId(Long binomeId);
}