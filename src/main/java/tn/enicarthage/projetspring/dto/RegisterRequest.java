package tn.enicarthage.projetspring.dto;

import jakarta.validation.constraints.*;

public class RegisterRequest {

    @NotBlank(message = "Le nom est obligatoire")
    @Size(min = 2, max = 50, message = "Le nom doit contenir entre 2 et 50 caractères")
    @Pattern(regexp = "^[a-zA-ZÀ-ÿ\\s\\-']+$", message = "Le nom ne doit contenir que des lettres")
    private String nom;

    @NotBlank(message = "Le prénom est obligatoire")
    @Size(min = 2, max = 50, message = "Le prénom doit contenir entre 2 et 50 caractères")
    @Pattern(regexp = "^[a-zA-ZÀ-ÿ\\s\\-']+$", message = "Le prénom ne doit contenir que des lettres")
    private String prenom;

    @NotBlank(message = "L'email est obligatoire")
    @Pattern(
            regexp = "^[a-zA-Z0-9._%+\\-]+@enicar\\.ucar\\.tn$",
            message = "L'email doit être une adresse @enicar.ucar.tn"
    )
    private String email;

    @NotBlank(message = "Le mot de passe est obligatoire")
    @Size(min = 8, message = "Le mot de passe doit contenir au moins 8 caractères")
    @Pattern(
            regexp = "^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?]).+$",
            message = "Le mot de passe doit contenir au moins 1 majuscule, 1 chiffre et 1 caractère spécial"
    )
    private String password;

    @NotBlank(message = "Le rôle est obligatoire")
    @Pattern(regexp = "^(ETUDIANT|ENSEIGNANT)$", message = "Rôle invalide")
    private String role;

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getPrenom() { return prenom; }
    public void setPrenom(String prenom) { this.prenom = prenom; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}