package tn.enicarthage.projetspring.dto;
import lombok.Data;

@Data
public class LoginRequest {
    private String nom;
    private String prenom;
    private String email;
    private String password;
}


