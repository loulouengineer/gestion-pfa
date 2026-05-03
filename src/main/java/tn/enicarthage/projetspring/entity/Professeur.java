package tn.enicarthage.projetspring.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@PrimaryKeyJoinColumn(name = "utilisateur_id")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)
public class Professeur extends User {

    @Column(nullable = false)
    private String departement;

    @JsonIgnore
    @OneToMany(mappedBy = "encadrant", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Sujet> sujets = new ArrayList<>();

    @JsonIgnore
    @ManyToMany(mappedBy = "jury")
    @Builder.Default
    private List<Creneau> creneaux = new ArrayList<>();
}