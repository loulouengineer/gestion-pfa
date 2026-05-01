package tn.enicarthage.projetspring.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
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

    private static final String CHEF  = "ROLE_CHEF_DEPT";
    private static final String PROF  = "ROLE_ENSEIGNANT";
    private static final String ETU   = "ROLE_ETUDIANT";
    private static final String[] ALL_ROLES = {CHEF, PROF, ETU};

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
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth

                // ── Public ────────────────────────────────────────────────
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/etudiants/inscrire").permitAll()

                // ── Chef only ─────────────────────────────────────────────
                .requestMatchers(HttpMethod.POST,   "/api/affectations/lancer").hasAuthority(CHEF)
                .requestMatchers(HttpMethod.PUT,    "/api/affectations/*/valider").hasAuthority(CHEF)
                .requestMatchers(HttpMethod.PUT,    "/api/affectations/*/refuser").hasAuthority(CHEF)
                .requestMatchers(HttpMethod.PATCH,  "/api/sujets/*/statut").hasAuthority(CHEF)
                .requestMatchers(HttpMethod.POST,   "/api/creneaux").hasAuthority(CHEF)
                .requestMatchers(HttpMethod.PUT,    "/api/creneaux/*").hasAuthority(CHEF)
                .requestMatchers(HttpMethod.DELETE, "/api/creneaux/*").hasAuthority(CHEF)
                .requestMatchers(HttpMethod.POST,   "/api/soutenances/planifier").hasAuthority(CHEF)
                .requestMatchers(HttpMethod.POST,   "/api/soutenances/planifier-auto").hasAuthority(CHEF)
                .requestMatchers(HttpMethod.DELETE, "/api/soutenances/*").hasAuthority(CHEF)
                .requestMatchers(HttpMethod.PUT,    "/api/soutenances/*/resultat").hasAuthority(CHEF)
                .requestMatchers(HttpMethod.POST,   "/api/notifications/**").hasAuthority(CHEF)
                .requestMatchers(HttpMethod.PUT,    "/api/notifications/lire-toutes").hasAnyAuthority(ALL_ROLES)
                .requestMatchers(HttpMethod.PUT,    "/api/notifications/*/lire").hasAnyAuthority(ALL_ROLES)
                .requestMatchers("/api/resultats/export/**").hasAuthority(CHEF)
                .requestMatchers(HttpMethod.POST,   "/api/resultats").hasAuthority(CHEF)
                .requestMatchers(HttpMethod.PUT,    "/api/resultats/*").hasAuthority(CHEF)
                .requestMatchers(HttpMethod.DELETE, "/api/resultats/*").hasAuthority(CHEF)
                .requestMatchers("/api/dashboard/**").hasAnyAuthority(CHEF, ETU)

                // ── Prof only ─────────────────────────────────────────────
                .requestMatchers(HttpMethod.POST,   "/api/sujets").hasAuthority(PROF)
                .requestMatchers(HttpMethod.DELETE, "/api/sujets/*").hasAuthority(PROF)
                .requestMatchers("/api/sujets/mes-sujets").hasAuthority(PROF)
                .requestMatchers(HttpMethod.POST,   "/api/disponibilites").hasAnyAuthority(PROF, CHEF)
                .requestMatchers(HttpMethod.PUT,    "/api/disponibilites/*").hasAnyAuthority(PROF, CHEF)
                .requestMatchers(HttpMethod.DELETE, "/api/disponibilites/*").hasAnyAuthority(PROF, CHEF)

                // ── Etudiant only ─────────────────────────────────────────
                .requestMatchers(HttpMethod.POST,   "/api/binomes").hasAuthority(ETU)
                .requestMatchers(HttpMethod.DELETE, "/api/binomes/*").hasAuthority(ETU)
                .requestMatchers(HttpMethod.POST,   "/api/choix").hasAuthority(ETU)
                .requestMatchers(HttpMethod.DELETE, "/api/choix/**").hasAuthority(ETU)

                // ── All authenticated ──────────────────────────────────────
                .requestMatchers("/api/**").hasAnyAuthority(ALL_ROLES)

                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
