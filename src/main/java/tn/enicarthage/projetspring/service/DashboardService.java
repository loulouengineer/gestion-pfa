package tn.enicarthage.projetspring.service;

import tn.enicarthage.projetspring.dto.DashboardDTO;
import tn.enicarthage.projetspring.entity.Binome;
import tn.enicarthage.projetspring.entity.Etudiant;
import tn.enicarthage.projetspring.entity.Soutenance;
import tn.enicarthage.projetspring.repository.EtudiantRepository;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@Service
public class DashboardService {

    private final EtudiantRepository etudiantRepository;
    private final EntityManager entityManager;

    public DashboardService(EtudiantRepository etudiantRepository, EntityManager entityManager) {
        this.etudiantRepository = etudiantRepository;
        this.entityManager = entityManager;
    }

    public DashboardDTO getDashboardData(Long etudiantId) {
        Optional<Etudiant> etudiantOpt = etudiantRepository.findById(etudiantId);

        if (etudiantOpt.isEmpty()) {
            return DashboardDTO.builder()
                    .statutGlobal("Non trouvé")
                    .statutGlobalSub("Étudiant inexistant")
                    .binomeStatus("Erreur")
                    .binomeStatusSub("Action requise")
                    .sujetStatus("Aucun")
                    .sujetStatusSub("Sélectionnez un sujet")
                    .joursRestants(null)
                    .joursRestantsSub("Non planifié")
                    .progressPercentage(0)
                    .currentStep(1)
                    .build();
        }

        Etudiant etudiant = etudiantOpt.get();

        // 1. Chercher si l'étudiant a un binôme
        List<Binome> binomes = entityManager.createQuery(
                        "SELECT b FROM Binome b WHERE b.etudiant1.id = :etId OR b.etudiant2.id = :etId", Binome.class)
                .setParameter("etId", etudiantId)
                .getResultList();

        Binome binome = binomes.isEmpty() ? null : binomes.get(0);

        String binomeStatus = "Non défini";
        String binomeStatusSub = "Action requise";
        int currentStep = 1;
        int progressPercentage = 10;

        if (binome != null) {
            Etudiant partenaire = binome.getEtudiant1().getId().equals(etudiantId) ? binome.getEtudiant2() : binome.getEtudiant1();
            if (partenaire != null) {
                binomeStatus = "Avec " + partenaire.getNom();
                binomeStatusSub = "Binôme validé";
            } else {
                binomeStatus = "En attente";
                binomeStatusSub = "Cherche partenaire";
            }
            currentStep = 2;
            progressPercentage = 30;
        }

        // 2. Chercher si le binôme a une soutenance (et donc un sujet validé)
        Soutenance soutenance = null;
        if (binome != null) {
            List<Soutenance> soutenances = entityManager.createQuery(
                            "SELECT s FROM Soutenance s WHERE s.binome.id = :binomeId", Soutenance.class)
                    .setParameter("binomeId", binome.getId())
                    .getResultList();
            if (!soutenances.isEmpty()) {
                soutenance = soutenances.get(0);
            }
        }

        String sujetStatus = "Aucun";
        String sujetStatusSub = "Sélectionnez un sujet";
        Integer joursRestants = null;
        String joursRestantsSub = "Avant la soutenance";
        String statutGlobal = "En cours";
        String statutGlobalSub = "Phase 2 : Sélection des sujets";

        if (soutenance != null && soutenance.getSujet() != null) {
            sujetStatus = "Validé";
            sujetStatusSub = soutenance.getSujet().getTitre();
            currentStep = 3;
            progressPercentage = 60;
            statutGlobalSub = "Phase 3 : Préparation du rapport";

            if (soutenance.getDateHeure() != null) {
                long days = ChronoUnit.DAYS.between(LocalDateTime.now(), soutenance.getDateHeure());
                joursRestants = (int) days;
                if (days < 0) {
                    joursRestants = 0;
                    joursRestantsSub = "Soutenance passée";
                    currentStep = 4;
                    progressPercentage = 100;
                    statutGlobalSub = "Phase 4 : Terminé";
                }
            }
        }

        return DashboardDTO.builder()
                .statutGlobal(statutGlobal)
                .statutGlobalSub(statutGlobalSub)
                .binomeStatus(binomeStatus)
                .binomeStatusSub(binomeStatusSub)
                .sujetStatus(sujetStatus)
                .sujetStatusSub(sujetStatusSub)
                .joursRestants(joursRestants)
                .joursRestantsSub(joursRestantsSub)
                .progressPercentage(progressPercentage)
                .currentStep(currentStep)
                .build();
    }
}