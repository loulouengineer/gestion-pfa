package com.pfa.gestion_pfa.Repository;

import com.pfa.gestion_pfa.model.Sujet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SujetRepository extends JpaRepository<Sujet, Long> {
    List<Sujet> findByDisponibleTrueAndConfirmeTrue();
    List<Sujet> findByEncadrantId(Long professeurId);
    List<Sujet> findByConfirmeTrue();
}