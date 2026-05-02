package tn.enicarthage.projetspring.service;


import tn.enicarthage.projetspring.entity.Affectation;
import tn.enicarthage.projetspring.entity.Binome;
import tn.enicarthage.projetspring.entity.ChoixSujet;
import tn.enicarthage.projetspring.entity.Sujet;
import tn.enicarthage.projetspring.entity.StatutSujet;
import tn.enicarthage.projetspring.repository.AffectationRepository;
import tn.enicarthage.projetspring.repository.BinomeRepository;
import tn.enicarthage.projetspring.repository.SujetRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class MoteurAffectationService {

    private final BinomeRepository binomeRepository;
    private final AffectationRepository affectationRepository;
    private final SujetRepository sujetRepository;

    /**
     * Algorithme glouton d'affectation :
     * 1. Trier les binômes par moyenneBinome décroissante (meilleurs en premier)
     * 2. Pour chaque binôme, parcourir ses choix dans l'ordre (1 → 5)
     * 3. Affecter le premier sujet encore disponible
     * 4. Marquer ce sujet comme non disponible
     */
    @Transactional
    public List<Affectation> affecterSujets() {
        // Delete only non-locked affectations (EN_ATTENTE + REFUSEE).
        // Keep VALIDEE (verrouillee=true) — those may be linked to Soutenances.
        List<Affectation> nonVerrouillee = affectationRepository.findByVerrouilleeFalse();
        affectationRepository.deleteAll(nonVerrouillee);
        affectationRepository.flush();

        // Collect binome/sujet IDs already locked by a validated affectation — skip them
        List<Affectation> validees = affectationRepository.findByVerrouilleeTrue();
        List<Long> dejaAffectesBinomeIds = validees.stream()
                .map(a -> a.getBinome().getId()).toList();
        List<Long> sujetsDejaPris = validees.stream()
                .map(a -> a.getSujet().getId()).toList();

        List<Sujet> sujetsApprouves = sujetRepository.findByStatut(StatutSujet.APPROUVE);
        sujetsApprouves.forEach(s -> s.setDisponible(!sujetsDejaPris.contains(s.getId())));
        sujetRepository.saveAll(sujetsApprouves);

        List<Binome> binomes = binomeRepository.findAllByOrderByMoyenneBinomeDesc();
        List<Affectation> resultats = new ArrayList<>();

        for (Binome binome : binomes) {
            // Skip binomes already locked (validated affectation exists)
            if (dejaAffectesBinomeIds.contains(binome.getId())) {
                log.info("⏭ Binôme {} déjà affecté (validé) — ignoré.", binome.getId());
                continue;
            }

            List<ChoixSujet> choix = binome.getChoix();
            if (choix == null || choix.isEmpty()) {
                log.warn("Binôme {} sans choix — ignoré.", binome.getId());
                continue;
            }

            boolean affecte = false;
            for (ChoixSujet choixSujet : choix) {
                Sujet sujet = choixSujet.getSujet();

                if (sujet.isDisponible()) {
                    float score = calculerScore(binome, choixSujet);

                    Affectation affectation = Affectation.builder()
                            .binome(binome)
                            .sujet(sujet)
                            .score(score)
                            .build();

                    affectationRepository.save(affectation);
                    resultats.add(affectation);

                    sujet.setDisponible(false);
                    sujetRepository.save(sujet);

                    log.info("✓ Binôme {} (moy. {}) → '{}' (choix n°{})",
                            binome.getId(), binome.getMoyenneBinome(),
                            sujet.getTitre(), choixSujet.getOrdre());

                    affecte = true;
                    break;
                }
            }

            if (!affecte) {
                log.warn("✗ Binôme {} : aucun de ses {} choix n'est disponible.",
                        binome.getId(), choix.size());
            }
        }

        log.info("Affectation terminée : {}/{} binômes affectés.",
                resultats.size(), binomes.size());
        return resultats;
    }

    public List<Affectation> getToutesAffectations() {
        return affectationRepository.findAll();
    }

    public Optional<Affectation> getAffectationParBinome(Long binomeId) {
        return affectationRepository.findByBinomeId(binomeId);
    }

    /**
     * Score = moyenne binôme × bonus ordre
     * Choix 1 → bonus 1.0 | Choix 5 → bonus 0.2
     */
    private float calculerScore(Binome binome, ChoixSujet choix) {
        float bonusOrdre = (6f - (float) choix.getOrdre()) / 5f;
        return (float) binome.getMoyenneBinome() * bonusOrdre;
    }
    }
