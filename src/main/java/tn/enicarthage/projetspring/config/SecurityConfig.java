package tn.enicarthage.projetspring.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;
import tn.enicarthage.projetspring.security.JwtFilter;

@EnableMethodSecurity
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtFilter jwtFilter;
    private final CorsConfigurationSource corsConfigurationSource;

    public SecurityConfig(JwtFilter jwtFilter, CorsConfigurationSource corsConfigurationSource) {
        this.jwtFilter = jwtFilter;
        this.corsConfigurationSource = corsConfigurationSource;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // ✅ Endpoints publics (sans token)
                        .requestMatchers(
                                "/api/auth/login",
                                "/api/auth/login-etudiant",
                                "/api/auth/register",
                                "/api/auth/confirmer",
                                "/api/etudiants/inscrire",
                                "/api/auth/mot-de-passe-oublie",   // ← AJOUT
                                "/api/auth/reinitialiser-mdp"
                        ).permitAll()

                        //  Reste de /api/auth/** (si besoin)
                        .requestMatchers("/api/auth/**").permitAll()

                        //  Endpoints étudiants
                        .requestMatchers("/api/sujets/disponibles").hasAnyRole("ETUDIANT", "ADMIN")
                        .requestMatchers("/api/binomes/par-etudiant/**").hasAnyRole("ETUDIANT", "ADMIN")
                        .requestMatchers("/api/binomes/**").hasAnyRole("ETUDIANT", "ADMIN")
                        .requestMatchers("/api/recommandation/**").hasAnyRole("ETUDIANT", "ADMIN")

                        //  Tout le reste nécessite une authentification
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}