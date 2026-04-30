package tn.enicarthage.projetspring;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import tn.enicarthage.projetspring.entity.Role;
import tn.enicarthage.projetspring.entity.StatutCompte;
import tn.enicarthage.projetspring.entity.User;
import tn.enicarthage.projetspring.repository.UserRepository;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initChefDepartement(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        return args -> {
            String emailChef = "wiem.omrani@enicar.ucar.tn";

            // Créer seulement s'il n'existe pas déjà
            if (!userRepository.existsByEmail(emailChef)) {
                User chef = new User();
                chef.setNom("Chef");
                chef.setPrenom("Département");
                chef.setEmail(emailChef);
                chef.setPassword(passwordEncoder.encode("chef1234")); // mot de passe
                chef.setRole(Role. CHEF_DEPT); // 🆕 nouveau rôle
                chef.setStatut(StatutCompte.APPROUVE); // directement approuvé
                userRepository.save(chef);

                System.out.println("✅ Compte chef de département créé.");
            }
        };
    }
}