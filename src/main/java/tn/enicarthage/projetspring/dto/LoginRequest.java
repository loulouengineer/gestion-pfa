package tn.enicarthage.projetspring.dto;
import lombok.Data;

@Data
public class LoginRequest {
    private String nom;
    private String prenom;  // ← must match the JSON key exactly
    private String email;
    private String password;
}


