package com.pfa.gestion_pfa.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.ArrayList;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "professeur")
public class Professeur extends Utilisateur {

    private String departement;

    @JsonIgnore
    @ManyToMany(mappedBy = "jury")
    private List<Creneau> creneaux = new ArrayList<>();
}