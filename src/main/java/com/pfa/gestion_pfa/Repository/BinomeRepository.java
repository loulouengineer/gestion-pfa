package com.pfa.gestion_pfa.Repository;

import com.pfa.gestion_pfa.model.Binome;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface BinomeRepository extends JpaRepository<Binome, Long> {
    Optional<Binome> findByEtudiant1IdOrEtudiant2Id(Long id1, Long id2);
    List<Binome> findAllByOrderByMoyenneBinomeDesc();
}