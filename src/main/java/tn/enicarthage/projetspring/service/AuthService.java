package tn.enicarthage.projetspring.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.enicarthage.projetspring.dto.AuthResponse;
import tn.enicarthage.projetspring.dto.LoginRequest;
import tn.enicarthage.projetspring.dto.RegisterRequest;
import tn.enicarthage.projetspring.entity.Etudiant;
import tn.enicarthage.projetspring.entity.Professeur;
import tn.enicarthage.projetspring.entity.Role;
import tn.enicarthage.projetspring.entity.StatutCompte;
import tn.enicarthage.projetspring.entity.User;
import tn.enicarthage.projetspring.repository.EtudiantRepository;
import tn.enicarthage.projetspring.repository.ProfesseurRepository;
import tn.enicarthage.projetspring.repository.UserRepository;
import tn.enicarthage.projetspring.security.JwtUtil;

import java.util.List;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private jakarta.persistence.EntityManager entityManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EtudiantRepository etudiantRepository;

    @Autowired
    private ProfesseurRepository professeurRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private JavaMailSender mailSender;

    @Value("${chef.departement.email}")
    private String chefEmail;

    @Value("${app.base-url}")
    private String baseUrl;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    public String demanderReinitialisationMotDePasse(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Aucun compte trouvé avec cet email"));

        String token = UUID.randomUUID().toString();
        user.setTokenConfirmation(token);
        userRepository.save(user);

        String lien = frontendUrl + "/reinitialiser-mdp?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(user.getEmail());
        message.setSubject("Réinitialisation de votre mot de passe");
        message.setText(
                "Bonjour " + user.getNom() + ",\n\n" +
                        "Cliquez sur le lien suivant pour réinitialiser votre mot de passe :\n\n" +
                        lien + "\n\n" +
                        "Ce lien est valable une seule fois.\n\n" +
                        "Si vous n'avez pas fait cette demande, ignorez cet email.\n\n" +
                        "Cordialement."
        );
        mailSender.send(message);

        return "Un email de réinitialisation a été envoyé.";
    }

    public String reinitialiserMotDePasse(String token, String nouveauMotDePasse) {
        User user = userRepository.findByTokenConfirmation(token)
                .orElseThrow(() -> new RuntimeException("Token invalide ou expiré"));

        user.setPassword(passwordEncoder.encode(nouveauMotDePasse));
        user.setTokenConfirmation(null);
        userRepository.save(user);

        return "Mot de passe réinitialisé avec succès !";
    }

    private static final List<String> MOTS_INTERDITS = List.of(
            "admin", "test", "null", "undefined", "root", "user",
            "chat", "chien", "lapin", "cheval", "vache", "mouton",
            "lion", "tigre", "ours", "loup", "renard", "cochon"
    );

    private void validerNom(String nom, String champ) {
        String nomLower = nom.toLowerCase().trim();
        for (String mot : MOTS_INTERDITS) {
            if (nomLower.equals(mot) || nomLower.contains(mot)) {
                throw new RuntimeException("Le " + champ + " '" + nom + "' n'est pas valide");
            }
        }
        if (nom.trim().length() < 2) {
            throw new RuntimeException("Le " + champ + " est trop court");
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public String register(RegisterRequest request) {
        validerNom(request.getNom(), "nom");
        validerNom(request.getPrenom(), "prénom");
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email déjà utilisé");
        }

        String token = UUID.randomUUID().toString();

        User user = new User();
        user.setNom(request.getNom());
        user.setPrenom(request.getPrenom());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.valueOf(request.getRole()));
        user.setStatut(StatutCompte.EN_ATTENTE);
        user.setTokenConfirmation(token);

        userRepository.save(user);
        System.out.println(">>> User sauvegardé, appel envoyerEmailChef...");

        try {
            envoyerEmailChef(user, token);
            System.out.println(">>> Email envoyé avec succès !");
        } catch (Exception e) {
            System.out.println(">>> ERREUR envoi email : " + e.getMessage());
            e.printStackTrace();
        }

        return "Votre demande a été envoyée. En attente de validation du chef de département.";
    }

    @Transactional
    public String confirmerCompte(String token, String action) {
        User user = userRepository.findByTokenConfirmation(token)
                .orElseThrow(() -> new RuntimeException("Token invalide ou expiré"));
        return validerUserInternal(user, action.equalsIgnoreCase("APPROUVE"));
    }

    public List<User> getPendingUsers() {
        return userRepository.findByStatut(StatutCompte.EN_ATTENTE);
    }

    @Transactional
    public String validerUserParId(Long userId, boolean approuve) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        return validerUserInternal(user, approuve);
    }

    private String validerUserInternal(User user, boolean approuve) {
        if (approuve) {
            user.setStatut(StatutCompte.APPROUVE);
            user.setTokenConfirmation(null);
            userRepository.save(user);

            if (user.getRole() == Role.ETUDIANT) {
                etudiantRepository.creerEtudiantDepuisUser(
                        user.getId(),
                        "ETU-" + System.currentTimeMillis()
                );
            } else if (user.getRole() == Role.ENSEIGNANT) {
                entityManager.createNativeQuery(
                                "INSERT INTO professeur (utilisateur_id, departement) VALUES (?, ?)"
                        )
                        .setParameter(1, user.getId())
                        .setParameter(2, "Non défini")
                        .executeUpdate();
            }

            envoyerEmailEtudiant(user, true);
            return "Compte approuvé avec succès !";
        } else {
            user.setStatut(StatutCompte.REFUSE);
            user.setTokenConfirmation(null);
            userRepository.save(user);
            envoyerEmailEtudiant(user, false);
            return "Compte refusé.";
        }
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Email ou mot de passe incorrect"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Email ou mot de passe incorrect");
        }

        if (user.getStatut() != StatutCompte.APPROUVE) {
            throw new RuntimeException("Votre compte n'est pas encore approuvé par le chef de département.");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return new AuthResponse(token, user.getRole().name(), user.getNom(), user.getId());
    }

    public AuthResponse loginEtudiant(LoginRequest request) {
        Etudiant etudiant = etudiantRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Email ou mot de passe incorrect"));

        if (!passwordEncoder.matches(request.getPassword(), etudiant.getPassword())) {
            throw new RuntimeException("Email ou mot de passe incorrect");
        }

        if (etudiant.getStatut() != StatutCompte.APPROUVE) {
            throw new RuntimeException("Votre compte n'est pas encore approuvé par le chef de département.");
        }

        String token = jwtUtil.generateToken(etudiant.getEmail(), "ETUDIANT");
        return new AuthResponse(token, "ETUDIANT", etudiant.getNom(), etudiant.getId());
    }

    private void envoyerEmailChef(User user, String token) {
        String lienApprouver = baseUrl + "/api/auth/confirmer?token=" + token + "&action=APPROUVE";
        String lienRefuser   = baseUrl + "/api/auth/confirmer?token=" + token + "&action=REFUSE";

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(chefEmail);
        message.setSubject("Demande de création de compte - " + user.getNom() + " " + user.getPrenom());
        message.setText(
                "Bonjour,\n\n" +
                        "Un nouvel utilisateur demande la création d'un compte :\n\n" +
                        "Nom    : " + user.getNom() + " " + user.getPrenom() + "\n" +
                        "Email  : " + user.getEmail() + "\n" +
                        "Rôle   : " + user.getRole() + "\n\n" +
                        "✅ Approuver : " + lienApprouver + "\n" +
                        "❌ Refuser   : " + lienRefuser + "\n\n" +
                        "Cordialement."
        );
        mailSender.send(message);
    }

    private void envoyerEmailEtudiant(User user, boolean approuve) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(user.getEmail());
        message.setSubject("Résultat de votre demande de compte");
        message.setText(approuve
                ? "Bonjour " + user.getNom() + ",\n\nVotre compte a été approuvé. Vous pouvez maintenant vous connecter.\n\nCordialement."
                : "Bonjour " + user.getNom() + ",\n\nVotre demande de création de compte a été refusée. Contactez le chef de département pour plus d'informations.\n\nCordialement."
        );
        mailSender.send(message);
    }
}