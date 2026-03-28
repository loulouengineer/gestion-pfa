package com.pfa.gestion_pfa.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "professeur")
public class Professeur extends Utilisateur {

    private String departement;
}