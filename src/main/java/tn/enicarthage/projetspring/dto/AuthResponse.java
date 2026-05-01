package tn.enicarthage.projetspring.dto;

public class AuthResponse {
    private String token;
    private String role;
    private String nom;
    private Long id;
    private Double moyenne;
    private String matricule;

    public AuthResponse(String token, String role, String nom, Long id) {
        this.token = token;
        this.role = role;
        this.nom = nom;
        this.id = id;
    }

    public AuthResponse(String token, String role, String nom, Long id, Double moyenne, String matricule) {
        this.token = token;
        this.role = role;
        this.nom = nom;
        this.id = id;
        this.moyenne = moyenne;
        this.matricule = matricule;
    }

    public String getToken() { return token; }
    public String getRole() { return role; }
    public String getNom() { return nom; }
    public Long getId() { return id; }
    public Double getMoyenne() { return moyenne; }
    public String getMatricule() { return matricule; }
}