package com.pfa.gestion_pfa.service;

import com.pfa.gestion_pfa.model.Binome;
import com.pfa.gestion_pfa.model.Etudiant;
import com.pfa.gestion_pfa.repository.BinomeRepository;
import com.pfa.gestion_pfa.repository.EtudiantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Service métier — Formation et consultation des binômes.
 * Contribution de Chaima.
 *
 * Règles :
 * - Les deux étudiants sont obligatoires (pas de travail solo)
 * - Un étudiant ne peut appartenir qu'à un seul binôme
 */
@Service
@RequiredArgsConstructor
public class BinomeService {

    private final BinomeRepository binomeRepository;
    private final EtudiantRepository etudiantRepository;

    @Transactional
    public Binome formerBinome(Long etudiant1Id, Long etudiant2Id) {
        if (etudiant1Id == null || etudiant2Id == null)
            throw new IllegalArgumentException("Les deux étudiants sont obligatoires pour former un binôme.");
        if (etudiant1Id.equals(etudiant2Id))
            throw new IllegalArgumentException("Un étudiant ne peut pas être son propre binôme.");

        Etudiant e1 = etudiantRepository.findById(etudiant1Id)
                .orElseThrow(() -> new RuntimeException("Étudiant introuvable : " + etudiant1Id));
        Etudiant e2 = etudiantRepository.findById(etudiant2Id)
                .orElseThrow(() -> new RuntimeException("Étudiant introuvable : " + etudiant2Id));

        if (binomeRepository.findByEtudiant1IdOrEtudiant2Id(etudiant1Id, etudiant1Id).isPresent())
            throw new RuntimeException("L'étudiant " + e1.getNom() + " est déjà dans un binôme.");
        if (binomeRepository.findByEtudiant1IdOrEtudiant2Id(etudiant2Id, etudiant2Id).isPresent())
            throw new RuntimeException("L'étudiant " + e2.getNom() + " est déjà dans un binôme.");

        Binome binome = new Binome();
        binome.setEtudiant1(e1);
        binome.setEtudiant2(e2);
        binome.calculerMoyenne();

        return binomeRepository.save(binome);
    }

    @Transactional(readOnly = true)
    public Optional<Binome> getBinomeParEtudiant(Long etudiantId) {
        return binomeRepository.findByEtudiant1IdOrEtudiant2Id(etudiantId, etudiantId);
    }

    @Transactional(readOnly = true)
    public Binome getBinomeById(Long id) {
        return binomeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Binôme introuvable : " + id));
    }

    @Transactional(readOnly = true)
    public List<Binome> getTousBinomesTriesParMoyenne() {
        return binomeRepository.findAllByOrderByMoyenneBinomeDesc();
    }
}
