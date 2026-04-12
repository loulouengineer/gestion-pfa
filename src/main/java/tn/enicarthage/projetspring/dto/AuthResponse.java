package tn.enicarthage.projetspring.dto;

public class AuthResponse {
    private String token;
    private String role;
    private String nom;

    public AuthResponse(String token, String role, String nom) {
        this.token = token;
        this.role = role;
        this.nom = nom;
    }

    public String getToken() { return token; }
    public String getRole() { return role; }
    public String getNom() { return nom; }
}