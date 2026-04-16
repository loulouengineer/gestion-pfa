package com.pfa.gestion_pfa.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.pfa.gestion_pfa.model.enums.Difficulte;
import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "etudiants")
@PrimaryKeyJoinColumn(name = "utilisateur_id")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)
public class Etudiant extends Utilisateur {

    @Column(nullable = false, unique = true)
    private String matricule;

    @Column(nullable = false)
    private float moyenne;

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
}