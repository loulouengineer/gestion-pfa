package tn.enicarthage.projetspring.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.enicarthage.projetspring.entity.*;
import tn.enicarthage.projetspring.repository.*;

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
        return creneauRepository.findByStatut(StatutCreneau.DISPONIBLE);
    }

    public Soutenance planifier(Long affectationId, Long creneauId, List<Professeur> jury) {
        Affectation affectation = affectationRepository.findById(affectationId)
                .orElseThrow(() -> new IllegalArgumentException("Affectation introuvable."));

        if (!affectation.isVerrouillee())
            throw new IllegalStateException("L'affectation doit être validée avant de planifier.");

        Creneau creneau = creneauRepository.findById(creneauId)
                .orElseThrow(() -> new IllegalArgumentException("Créneau introuvable."));

        if (!creneau.estDisponible())
            throw new IllegalStateException("Le créneau sélectionné est déjà occupé.");

        verifierConflitsJury(creneau, jury);

        Professeur encadrant = affectation.getSujet().getEncadrant();
        if (encadrant != null && jury.stream().noneMatch(p -> p.getId().equals(encadrant.getId())))
            throw new IllegalArgumentException(
                    "L'encadrant " + encadrant.getNom() + " doit faire partie du jury.");

        Soutenance soutenance = new Soutenance();
        soutenance.setBinome(affectation.getBinome());
        soutenance.setAffectation(affectation);
        soutenance.setCreneau(creneau);

        List<Professeur> juryComplet = jury.stream()
                .map(p -> professeurRepository.findById(p.getId()).orElse(p))
                .collect(Collectors.toList());
        soutenance.setJury(juryComplet);
        creneau.setJury(juryComplet);
        creneau.occuper();
        creneauRepository.save(creneau);

        return soutenanceRepository.save(soutenance);
    }

    public List<Soutenance> planifierAutomatiquement() {
        List<Affectation> affectationsValidees =
                affectationRepository.findByStatut(StatutAffectation.VALIDEE);
        List<Creneau> creneauxDisponibles = new ArrayList<>(
                creneauRepository.findByStatut(StatutCreneau.DISPONIBLE));
        List<Professeur> tousProfs = professeurRepository.findAll();
        List<Soutenance> planifiees = new ArrayList<>();

        for (Affectation affectation : affectationsValidees) {
            if (soutenanceRepository.existsByBinome(affectation.getBinome())) continue;

            Professeur encadrant = affectation.getSujet().getEncadrant();

            for (Creneau creneau : creneauxDisponibles) {
                if (!creneau.estDisponible()) continue;

                List<Professeur> juryDispo = tousProfs.stream()
                        .filter(p -> !creneau.aConflitJury(p))
                        .filter(p -> disponibiliteProfRepository
                                .findByProfesseurIdAndDate(p.getId(), creneau.getDate())
                                .stream().anyMatch(d -> d.couvre(creneau)))
                        .collect(Collectors.toList());

                boolean encadrantDispo = encadrant == null || juryDispo.stream()
                        .anyMatch(p -> p.getId().equals(encadrant.getId()));
                if (!encadrantDispo || juryDispo.size() < 2) continue;

                List<Professeur> jury = new ArrayList<>();
                if (encadrant != null) jury.add(encadrant);
                juryDispo.stream().filter(p -> encadrant == null || !p.getId().equals(encadrant.getId()))
                        .findFirst().ifPresent(jury::add);

                Soutenance s = new Soutenance();
                s.setBinome(affectation.getBinome());
                s.setAffectation(affectation);
                s.setCreneau(creneau);
                s.setJury(jury);

                creneau.setJury(jury);
                creneau.occuper();
                creneauRepository.save(creneau);
                planifiees.add(soutenanceRepository.save(s));
                break;
            }
        }
        return planifiees;
    }

    private void verifierConflitSalle(Creneau nouveau) {
        List<Creneau> memeJour = creneauRepository.findBySalleAndDate(
                nouveau.getSalle(), nouveau.getDate());
        for (Creneau existant : memeJour) {
            if (!existant.getId().equals(nouveau.getId()) && nouveau.chevauche(existant))
                throw new IllegalStateException(
                        "Conflit de salle : " + nouveau.getSalle() +
                        " est déjà occupée sur ce créneau horaire.");
        }
    }

    private void verifierConflitsJury(Creneau creneau, List<Professeur> jury) {
        for (Professeur prof : jury) {
            List<Creneau> creneauxProf = creneauRepository.findByJuryId(prof.getId());
            for (Creneau c : creneauxProf) {
                if (c.chevauche(creneau))
                    throw new IllegalStateException(
                            "Conflit de jury : " + prof.getNom() +
                            " est déjà assigné à un autre créneau qui chevauche.");
            }
        }
    }
}
