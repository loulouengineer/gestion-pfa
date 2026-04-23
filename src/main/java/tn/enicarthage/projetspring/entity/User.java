package tn.enicarthage.projetspring.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity

@Inheritance(strategy = InheritanceType.JOINED)  // ← ajouté
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false)
    private String prenom;  // ← ajouté (utilisé dans Professeur)

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;
}