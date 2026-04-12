package com.pfa.gestion_pfa.controller;

import com.pfa.gestion_pfa.model.Utilisateur;
import com.pfa.gestion_pfa.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UtilisateurRepository utilisateurRepository;

    /**
     * POST /api/auth/login
     * Body: { email, motDePasse }
     * Returns: { id, nom, email, role }
     */
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> body) {
        String email      = body.get("email");
        String motDePasse = body.get("motDePasse");

        if (email == null || motDePasse == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("erreur", "Email et mot de passe requis."));
        }

        Optional<Utilisateur> userOpt = utilisateurRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401)
                    .body(Map.of("erreur", "Email introuvable."));
        }

        Utilisateur user = userOpt.get();

        if (!user.getMotDePasse().equals(motDePasse)) {
            return ResponseEntity.status(401)
                    .body(Map.of("erreur", "Mot de passe incorrect."));
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id",    user.getId());
        response.put("nom",   user.getNom());
        response.put("email", user.getEmail());
        response.put("role",  user.getRole().name());

        // If professor, include department
        if (user.getRole().name().equals("PROFESSEUR")) {
            try {
                com.pfa.gestion_pfa.model.Professeur prof =
                        (com.pfa.gestion_pfa.model.Professeur) user;
                response.put("departement", prof.getDepartement());
            } catch (ClassCastException e) {
                // fallback
            }
        }

        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/auth/me?id=2
     * Returns current user info
     */
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me(@RequestParam Long id) {
        return utilisateurRepository.findById(id)
                .map(u -> {
                    Map<String, Object> r = new LinkedHashMap<>();
                    r.put("id",    u.getId());
                    r.put("nom",   u.getNom());
                    r.put("email", u.getEmail());
                    r.put("role",  u.getRole().name());
                    return ResponseEntity.ok(r);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}