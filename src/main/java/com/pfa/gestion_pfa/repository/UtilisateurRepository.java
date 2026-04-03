package com.pfa.gestion_pfa.repository;

import com.pfa.gestion_pfa.model.Utilisateur;
import com.pfa.gestion_pfa.model.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UtilisateurRepository extends JpaRepository<Utilisateur, Long> {

    /** Utilisé par UserDetailsService pour l'authentification */
    Optional<Utilisateur> findByEmail(String email);

    /** Vérifie si un email est déjà enregistré */
    boolean existsByEmail(String email);

    /** Tous les utilisateurs d'un rôle donné */
    List<Utilisateur> findByRole(Role role);
}