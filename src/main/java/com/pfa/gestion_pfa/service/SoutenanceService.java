package com.pfa.gestion_pfa.service;

import com.pfa.gestion_pfa.model.*;
import com.pfa.gestion_pfa.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class SoutenanceService {

    private final SoutenanceRepository soutenanceRepository;
    private final CreneauRepository creneauRepository;
    private final DisponibiliteProfRepository disponibiliteProfRepository;
    private final AffectationRepository affectationRepository;
    private final ProfesseurRepository professeurRepository;

    // ══════════════════════════════════════════════════
    // PHASE 2 — Créneaux & Disponibilités
    // ══════════════════════════════════════════════════

    public Creneau ajouterCreneau(Creneau creneau) {
        creneau.calculerHeureFin();
        verifierConflitSalle(creneau);
        return creneauRepository.save(creneau);
    }

    public DisponibiliteProf enregistrerDisponibilite(DisponibiliteProf disponibilite) {
        return disponibiliteProfRepository.save(disponibilite);
    }

    @Transactional(readOnly = true)
    public List<DisponibiliteProf> getDisponibilites(Long professeurId) {
        return disponibiliteProfRepository.findByProfesseurId(professeurId);
    }

    @Transactional(readOnly = true)
    public List<Creneau> getCreneauxDisponibles() {
        return creneauRepository.findByStatut(
                com.pfa.gestion_pfa.model.enums.StatutCreneau.DISPONIBLE
        );
    }

    // ══════════════════════════════════════════════════
    // PHASE 3 — Planification manuelle
    // ══════════════════════════════════════════════════

    public Soutenance planifier(Long affectationId, Long creneauId, List<Professeur> jury) {
        Affectation affectation = affectationRepository.findById(affectationId)
                .orElseThrow(() -> new IllegalArgumentException("Affectation introuvable."));

        if (!affectation.isVerrouillee()) {
            throw new IllegalStateException("L'affectation doit être validée avant de planifier.");
        }

        Creneau creneau = creneauRepository.findById(creneauId)
                .orElseThrow(() -> new IllegalArgumentException("Créneau introuvable."));

        if (!creneau.estDisponible()) {
            throw new IllegalStateException("Le créneau sélectionné est déjà occupé.");
        }

        verifierConflitsJury(creneau, jury);

        Professeur encadrant = affectation.getSujet().getEncadrant();
        if (encadrant != null && jury.stream().noneMatch(p -> p.getId().equals(encadrant.getId()))) {
            throw new IllegalArgumentException(
                    "L'encadrant " + encadrant.getNom() + " doit faire partie du jury."
            );
        }

        Soutenance soutenance = new Soutenance();
        soutenance.setBinome(affectation.getBinome());
        soutenance.setAffectation(affectation);
        soutenance.setCreneau(creneau);

        // Charger les profs complets depuis la BDD
        List<Professeur> juryComplet = jury.stream()
                .map(p -> professeurRepository.findById(p.getId()).orElse(p))
                .collect(Collectors.toList());
        soutenance.setJury(juryComplet);

        creneau.setJury(juryComplet);
        creneau.occuper();
        creneauRepository.save(creneau);

        return soutenanceRepository.save(soutenance);
    }

    // ══════════════════════════════════════════════════
    // PHASE 3 — Planification automatique AVEC jury
    // ══════════════════════════════════════════════════

    public List<Soutenance> planifierAutomatiquement() {
        List<Affectation> affectationsValidees = affectationRepository
                .findByStatut(com.pfa.gestion_pfa.model.enums.StatutAffectation.VALIDEE);

        List<Creneau> creneauxDisponibles = new ArrayList<>(
                creneauRepository.findByStatut(com.pfa.gestion_pfa.model.enums.StatutCreneau.DISPONIBLE)
        );

        List<Professeur> tousProfs = professeurRepository.findAll();
        List<Soutenance> planifiees = new ArrayList<>();

        for (Affectation affectation : affectationsValidees) {
            // Déjà planifié ?
            if (soutenanceRepository.existsByBinome(affectation.getBinome())) continue;

            Professeur encadrant = affectation.getSujet().getEncadrant();

            for (Creneau creneau : creneauxDisponibles) {
                if (!creneau.estDisponible()) continue;

                // Construire le jury : encadrant + 1 autre prof disponible sans conflit
                List<Professeur> jury = new ArrayList<>();
                if (encadrant != null) jury.add(encadrant);

                // Chercher un 2ème membre du jury disponible
                for (Professeur prof : tousProfs) {
                    if (encadrant != null && prof.getId().equals(encadrant.getId())) continue;
                    if (jury.size() >= 2) break;

                    // Vérifier qu'il n'a pas de conflit sur ce créneau
                    boolean conflit = soutenanceRepository.findByJuryContaining(prof)
                            .stream()
                            .anyMatch(s -> s.getCreneau().chevauche(creneau));

                    if (!conflit) jury.add(prof);
                }

                if (jury.isEmpty()) continue;

                try {
                    Soutenance soutenance = new Soutenance();
                    soutenance.setBinome(affectation.getBinome());
                    soutenance.setAffectation(affectation);
                    soutenance.setCreneau(creneau);
                    soutenance.setJury(new ArrayList<>(jury));

                    creneau.setJury(new ArrayList<>(jury));
                    creneau.occuper();
                    creneauRepository.save(creneau);

                    planifiees.add(soutenanceRepository.save(soutenance));
                    break;
                } catch (Exception ignored) {
                    creneau.liberer();
                }
            }
        }

        return planifiees;
    }

    // ══════════════════════════════════════════════════
    // PHASE 4 — Planning final
    // ══════════════════════════════════════════════════

    @Transactional(readOnly = true)
    public List<Soutenance> getPlanningFinal() {
        return soutenanceRepository.findAllOrderByDateAndHeure();
    }

    @Transactional(readOnly = true)
    public List<Soutenance> getPlanningParDate(LocalDate date) {
        return soutenanceRepository.findByCreneauDate(date);
    }

    public Soutenance enregistrerResultat(Long soutenanceId, float note,
                                          String observations, boolean present) {
        if (note < 0 || note > 20) {
            throw new IllegalArgumentException("La note doit être entre 0 et 20.");
        }
        Soutenance soutenance = soutenanceRepository.findById(soutenanceId)
                .orElseThrow(() -> new IllegalArgumentException("Soutenance introuvable."));
        soutenance.terminer(note, observations, present);
        return soutenanceRepository.save(soutenance);
    }

    // ──────────────────────────────────────────────────
    // Méthodes privées
    // ──────────────────────────────────────────────────

    private void verifierConflitSalle(Creneau creneau) {
        List<Creneau> mêmeSalle = creneauRepository.findBySalleAndDate(
                creneau.getSalle(), creneau.getDate()
        );
        for (Creneau existing : mêmeSalle) {
            if (!existing.getId().equals(creneau.getId()) && existing.chevauche(creneau)) {
                throw new IllegalArgumentException(
                        "Conflit de salle : " + creneau.getSalle()
                                + " déjà occupée de " + creneau.getHeureDebut()
                                + " à " + creneau.getHeureFin()
                );
            }
        }
    }

    private void verifierConflitsJury(Creneau creneau, List<Professeur> jury) {
        for (Professeur prof : jury) {
            List<Soutenance> soutenancesProf = soutenanceRepository.findByJuryContaining(prof);
            for (Soutenance s : soutenancesProf) {
                if (s.getCreneau().chevauche(creneau)) {
                    throw new IllegalArgumentException(
                            "Conflit de jury : " + prof.getNom()
                                    + " est déjà assigné le " + s.getCreneau().getDate()
                                    + " à " + s.getCreneau().getHeureDebut()
                    );
                }
            }
        }
    }
}