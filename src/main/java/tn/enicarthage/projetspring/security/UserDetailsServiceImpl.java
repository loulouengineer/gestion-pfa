package tn.enicarthage.projetspring.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
import tn.enicarthage.projetspring.entity.Etudiant;
import tn.enicarthage.projetspring.entity.User;
import tn.enicarthage.projetspring.repository.EtudiantRepository;
import tn.enicarthage.projetspring.repository.UserRepository;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EtudiantRepository etudiantRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {

        // Cherche d'abord dans les users (enseignant, chef)
        java.util.Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            return org.springframework.security.core.userdetails.User
                    .withUsername(user.getEmail())
                    .password(user.getPassword())
                    .roles(user.getRole().name())
                    .build();
        }

        // Cherche ensuite dans les étudiants
        Etudiant etudiant = etudiantRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "Utilisateur non trouvé : " + email));

        return org.springframework.security.core.userdetails.User
                .withUsername(etudiant.getEmail())
                .password(etudiant.getPassword())
                .roles("ETUDIANT")
                .build();
    }
}