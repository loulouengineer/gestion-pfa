package tn.enicarthage.projetspring.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.enicarthage.projetspring.dto.AuthResponse;
import tn.enicarthage.projetspring.dto.LoginRequest;
import tn.enicarthage.projetspring.dto.RegisterRequest;
import tn.enicarthage.projetspring.service.AuthService;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            return ResponseEntity.ok(authService.register(request));
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", ex.getMessage()));
        }
    }

    @PostMapping("/login-etudiant")
    public ResponseEntity<?> loginEtudiant(@RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.loginEtudiant(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", ex.getMessage()));
        }
    }

    @GetMapping("/confirmer")
    public ResponseEntity<?> confirmerCompte(@RequestParam String token,
                                              @RequestParam String action) {
        try {
            return ResponseEntity.ok(authService.confirmerCompte(token, action));
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    @PostMapping("/mot-de-passe-oublie")
    public ResponseEntity<?> motDePasseOublie(@RequestBody Map<String, String> body) {
        try {
            return ResponseEntity.ok(authService.demanderReinitialisationMotDePasse(body.get("email")));
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    @PostMapping("/reinitialiser-mdp")
    public ResponseEntity<?> reinitialiserMdp(@RequestBody Map<String, String> body) {
        try {
            return ResponseEntity.ok(authService.reinitialiserMotDePasse(body.get("token"), body.get("motDePasse")));
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }
}
