package tn.enicarthage.projetspring.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;
import tn.enicarthage.projetspring.security.JwtFilter;
import org.springframework.context.annotation.Bean;

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
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/etudiants/inscrire").permitAll()
                        .requestMatchers("/api/etudiants/**").hasAnyAuthority("ROLE_ETUDIANT", "ROLE_ENSEIGNANT", "ROLE_CHEF_DEPT")
                        .requestMatchers("/api/choix/**").hasAnyAuthority("ROLE_ETUDIANT", "ROLE_ENSEIGNANT", "ROLE_CHEF_DEPT")
                        .requestMatchers("/api/sujets/**").hasAnyAuthority("ROLE_ETUDIANT", "ROLE_ENSEIGNANT", "ROLE_CHEF_DEPT")
                        .requestMatchers("/api/binomes/**").hasAnyAuthority("ROLE_ETUDIANT", "ROLE_ENSEIGNANT", "ROLE_CHEF_DEPT")
                        .requestMatchers("/api/recommandation/**").hasAnyAuthority("ROLE_ETUDIANT", "ROLE_ENSEIGNANT", "ROLE_CHEF_DEPT")
                        .requestMatchers("/api/recommandation-ia/**").hasAnyAuthority("ROLE_ETUDIANT", "ROLE_ENSEIGNANT", "ROLE_CHEF_DEPT")
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}