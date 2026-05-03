package tn.enicarthage.projetspring.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import tn.enicarthage.projetspring.entity.User;
import tn.enicarthage.projetspring.service.AuthService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('CHEF_DEPT')")
public class AdminController {

    @Autowired
    private AuthService authService;

    @GetMapping("/users/pending")
    public ResponseEntity<List<User>> getPendingUsers() {
        return ResponseEntity.ok(authService.getPendingUsers());
    }

    @PostMapping("/users/{id}/validate")
    public ResponseEntity<?> validateUser(@PathVariable Long id, @RequestParam boolean approuve) {
        try {
            String message = authService.validerUserParId(id, approuve);
            return ResponseEntity.ok(Map.of("message", message));
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }
}
