package com.pfa.gestion_pfa.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "etudiant")
public class Etudiant extends Utilisateur {

    private String matricule;
    private float moyenne;
}