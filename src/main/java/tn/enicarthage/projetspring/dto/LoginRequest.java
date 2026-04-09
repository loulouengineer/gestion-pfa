package tn.enicarthage.projetspring.dto;
import lombok.Data;

@Data
public class LoginRequest {
    private String email;
    private String password;
}


