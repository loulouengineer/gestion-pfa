package tn.enicarthage.projetspring.entity;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "etudiants")
public class Etudiant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private Double moyenne;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "etudiant_competences",
            joinColumns = @JoinColumn(name = "etudiant_id"))
    @Column(name = "competence")
    private List<String> competences;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public Double getMoyenne() { return moyenne; }
    public void setMoyenne(Double moyenne) { this.moyenne = moyenne; }

    public List<String> getCompetences() { return competences; }
    public void setCompetences(List<String> competences) { this.competences = competences; }
}