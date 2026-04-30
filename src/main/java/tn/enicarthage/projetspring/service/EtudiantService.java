package tn.enicarthage.projetspring.service;

import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import tn.enicarthage.projetspring.dto.EtudiantRequest;
import tn.enicarthage.projetspring.dto.RecommandationDTO;
import tn.enicarthage.projetspring.entity.*;
import tn.enicarthage.projetspring.repository.EtudiantRepository;
import tn.enicarthage.projetspring.repository.SujetRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@NoArgsConstructor
@Service
public class EtudiantService {

    @Autowired
    private EtudiantRepository etudiantRepository;

    @Autowired
    private SujetRepository sujetRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private OllamaService ollamaService;

    public Etudiant inscrire(EtudiantRequest request) {
        if (etudiantRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email déjà utilisé");
        }
        Etudiant etudiant = new Etudiant();
        etudiant.setNom(request.getNom());
        etudiant.setPrenom(request.getPrenom());                        // ← fix
        etudiant.setEmail(request.getEmail());
        etudiant.setPassword(passwordEncoder.encode(request.getPassword()));
        etudiant.setRole(Role.ETUDIANT);                                // ← fix
        etudiant.setMatricule("ETU-" + System.currentTimeMillis());     // ← fix
        etudiant.setMoyenne(request.getMoyenne().floatValue());
        etudiant.setCompetences(request.getCompetences());
        return etudiantRepository.save(etudiant);
    }

    // Ajoute cette méthode privée
    private String generateMatricule() {
        return "ETU-" + System.currentTimeMillis();
    }

    public List<RecommandationDTO> getRecommandations(String email) {
        Etudiant etudiant = etudiantRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Étudiant non trouvé"));

        List<Etudiant> tousEtudiants = etudiantRepository
                .findAllByOrderByMoyenneDesc();

        int rangEtudiant = 0;
        for (int i = 0; i < tousEtudiants.size(); i++) {
            if (tousEtudiants.get(i).getEmail().equals(email)) {
                rangEtudiant = i + 1;
                break;
            }
        }

        int totalEtudiants = tousEtudiants.size();

        List<Sujet> sujetsApprouves = sujetRepository
                .findByStatutOrderByRangAsc(StatutSujet.APPROUVE);

        int totalSujets = sujetsApprouves.size();

        List<RecommandationDTO> recommandations = new ArrayList<>();

        for (Sujet sujet : sujetsApprouves) {
            double score = calculerScore(etudiant, sujet,
                    rangEtudiant, totalEtudiants,
                    totalSujets);

            // Appel IA Ollama pour générer une analyse
            String prompt = construirePrompt(etudiant, sujet,
                    rangEtudiant, totalEtudiants);
            String analyseIA = ollamaService.genererRecommandation(prompt);

            String explication = genererExplication(etudiant, sujet,
                    rangEtudiant,
                    totalEtudiants, score);

            recommandations.add(new RecommandationDTO(
                    sujet.getId(),
                    sujet.getTitre(),
                    sujet.getDescription(),
                    score,
                    sujet.getRang(),
                    explication,
                    analyseIA
            ));
        }

        recommandations.sort((a, b) ->
                Double.compare(b.getScore(), a.getScore()));

        return recommandations.stream()
                .limit(5)
                .collect(Collectors.toList());
    }

    private String construirePrompt(Etudiant etudiant, Sujet sujet,
                                    int rangEtudiant, int totalEtudiants) {
        return String.format(
                "Tu es un conseiller académique. Analyse la compatibilité entre " +
                        "cet étudiant et ce sujet PFA en 2-3 phrases courtes en français.\n\n" +
                        "Étudiant: %s\n" +
                        "Moyenne: %.1f/20\n" +
                        "Classement: %d/%d\n" +
                        "Compétences: %s\n\n" +
                        "Sujet: %s\n" +
                        "Description: %s\n" +
                        "Compétences requises: %s\n" +
                        "Rang du sujet: %d\n\n" +
                        "Donne une analyse courte et précise.",
                etudiant.getNom(),
                etudiant.getMoyenne(),
                rangEtudiant, totalEtudiants,
                String.join(", ", etudiant.getCompetences()),
                sujet.getTitre(),
                sujet.getDescription(),
                String.join(", ", sujet.getCompetences()),
                sujet.getRang() != null ? sujet.getRang() : 0
        );
    }

    private double calculerScore(Etudiant etudiant, Sujet sujet,
                                 int rangEtudiant, int totalEtudiants,
                                 int totalSujets) {
        double score = 0;

        if (sujet.getRang() != null && totalSujets > 0) {
            double rangSujetNormalise = (double) sujet.getRang() / totalSujets;
            double rangEtudiantNormalise = (double) rangEtudiant / totalEtudiants;
            double compatibiliteRang = 1 - Math.abs(rangSujetNormalise - rangEtudiantNormalise);
            score += compatibiliteRang * 50;
        }

        List<String> competencesEtudiant = etudiant.getCompetences()
                .stream().map(String::toLowerCase).collect(Collectors.toList());
        List<String> competencesSujet = sujet.getCompetences()
                .stream().map(String::toLowerCase).collect(Collectors.toList());

        long competencesCommunes = competencesEtudiant.stream()
                .filter(competencesSujet::contains).count();

        if (!competencesSujet.isEmpty()) {
            score += (double) competencesCommunes / competencesSujet.size() * 30;
        }

        double bonusMoyenne = (etudiant.getMoyenne() / 20.0) * 20;
        score += bonusMoyenne;

        return Math.round(score * 10.0) / 10.0;
    }

    private String genererExplication(Etudiant etudiant, Sujet sujet,
                                      int rangEtudiant, int totalEtudiants,
                                      double score) {
        String msgRang = String.format(
                "Classé %d/%d avec moyenne %.1f/20.",
                rangEtudiant, totalEtudiants, etudiant.getMoyenne()
        );

        String msgScore = score >= 70 ? "Excellent choix !"
                : score >= 50 ? "Bon choix."
                : "Choix possible.";

        return msgRang + " " + msgScore;
    }

    public Etudiant getProfil(String email) {
        return etudiantRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Étudiant non trouvé"));
    }

    public Etudiant updateProfil(String email, EtudiantRequest request) {
        Etudiant etudiant = etudiantRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Étudiant non trouvé"));
        etudiant.setMoyenne(request.getMoyenne().floatValue());
        etudiant.setCompetences(request.getCompetences());
        return etudiantRepository.save(etudiant);
    }
}