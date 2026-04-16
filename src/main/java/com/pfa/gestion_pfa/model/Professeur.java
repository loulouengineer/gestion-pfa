package com.pfa.gestion_pfa.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "professeurs")
@PrimaryKeyJoinColumn(name = "utilisateur_id")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)
public class Professeur extends Utilisateur {

    @Column(nullable = false)
    private String departement;

    @OneToMany(mappedBy = "encadrant", cascade = CascadeType.ALL)
    private List<Sujet> sujets;
}