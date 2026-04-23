package tn.enicarthage.projetspring.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import tn.enicarthage.projetspring.dto.AuthResponse;
import tn.enicarthage.projetspring.dto.LoginRequest;
import tn.enicarthage.projetspring.dto.RegisterRequest;
import tn.enicarthage.projetspring.entity.Etudiant;
import tn.enicarthage.projetspring.entity.Role;
import tn.enicarthage.projetspring.entity.User;
import tn.enicarthage.projetspring.repository.EtudiantRepository;
import tn.enicarthage.projetspring.repository.UserRepository;
import tn.enicarthage.projetspring.security.JwtUtil;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EtudiantRepository etudiantRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email déjà utilisé");
        }

        User user = new User();
        user.setNom(request.getNom());
        user.setPrenom(request.getPrenom());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.valueOf(request.getRole()));

        user = userRepository.save(user); // ← récupère l'entité avec l'id généré

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return new AuthResponse(token, user.getRole().name(), user.getNom(), user.getId());
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Email ou mot de passe incorrect"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Email ou mot de passe incorrect");
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

        String token = jwtUtil.generateToken(etudiant.getEmail(), "ETUDIANT");
        return new AuthResponse(token, "ETUDIANT", etudiant.getNom(), etudiant.getId());
    }
}