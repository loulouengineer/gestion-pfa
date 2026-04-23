package tn.enicarthage.projetspring.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@PrimaryKeyJoinColumn(name = "utilisateur_id")  // ✅ valide maintenant car User a @Inheritance JOINED
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)
public class Professeur extends User {

    @Column(nullable = false)
    private String departement;

    @OneToMany(mappedBy = "encadrant", cascade = CascadeType.ALL)
    private List<Sujet> sujets;

    // ❌ getPrenom() supprimé — hérité automatiquement via @Data de User
}