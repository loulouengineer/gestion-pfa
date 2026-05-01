package tn.enicarthage.projetspring.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.enicarthage.projetspring.dto.AuthResponse;
import tn.enicarthage.projetspring.dto.LoginRequest;
import tn.enicarthage.projetspring.dto.RegisterRequest;
import tn.enicarthage.projetspring.service.AuthService;
import jakarta.validation.Valid;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    // 🆕 Retourne String au lieu de AuthResponse (pas de token avant validation)
    @PostMapping("/register")
    public ResponseEntity<String> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/login-etudiant")
    public ResponseEntity<AuthResponse> loginEtudiant(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.loginEtudiant(request));
    }

    // 🆕 Endpoint cliqué depuis l'email du chef
    @GetMapping("/confirmer")
    public ResponseEntity<String> confirmerCompte(
            @RequestParam String token,
            @RequestParam String action) {
        return ResponseEntity.ok(authService.confirmerCompte(token, action));



    }

    @PostMapping("/mot-de-passe-oublie")
    public ResponseEntity<String> motDePasseOublie(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(authService.demanderReinitialisationMotDePasse(body.get("email")));
    }

    @PostMapping("/reinitialiser-mdp")
    public ResponseEntity<String> reinitialiserMdp(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(authService.reinitialiserMotDePasse(body.get("token"), body.get("motDePasse")));
    }
}