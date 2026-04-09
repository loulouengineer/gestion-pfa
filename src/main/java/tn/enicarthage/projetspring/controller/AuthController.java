package tn.enicarthage.projetspring.controller;



import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.enicarthage.projetspring.dto.AuthResponse;
import tn.enicarthage.projetspring.dto.LoginRequest;
import tn.enicarthage.projetspring.dto.RegisterRequest;
import tn.enicarthage.projetspring.service.AuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
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
}
