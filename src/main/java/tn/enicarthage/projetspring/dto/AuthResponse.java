package tn.enicarthage.projetspring.dto;

public class AuthResponse {
    private String token;
    private String role;
    private String nom;
    private Long id;

    public AuthResponse(String token, String role, String nom, Long id) {
        this.token = token;
        this.role = role;
        this.nom = nom;
        this.id = id;
    }

    public String getToken() { return token; }
    public String getRole() { return role; }
    public String getNom() { return nom; }
    public Long getId() { return id; }
}