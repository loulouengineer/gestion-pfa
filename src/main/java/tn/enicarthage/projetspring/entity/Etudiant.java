package tn.enicarthage.projetspring.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@PrimaryKeyJoinColumn(name = "utilisateur_id")  // cohérent avec Professeur
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
@EqualsAndHashCode(callSuper = true)
public class Etudiant extends User {

    // ❌ Supprimé : id, nom, email, password → déjà dans User

    @Column(nullable = false)
    private double moyenne;

    @Column(nullable = true, unique = true) // ← nullable = true
    private String matricule;

    @Builder.Default
    @Column(nullable = false)
    private boolean aUnBinome = false;

    @ElementCollection(targetClass = Difficulte.class, fetch = FetchType.EAGER)
    @CollectionTable(
            name = "etudiant_difficultes",
            joinColumns = @JoinColumn(name = "etudiant_id")
    )
    @Enumerated(EnumType.STRING)
    @Column(name = "difficulte")
    @Builder.Default
    @JsonIgnore
    private List<Difficulte> difficultes = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "etudiant_competences",
            joinColumns = @JoinColumn(name = "etudiant_id")
    )
    @Column(name = "competence")
    private List<String> competences;

    // ❌ Tous les getters/setters manuels supprimés → gérés par @Getter @Setter
    // ❌ getMatricule() supprimé → s'appelait elle-même infiniment
}