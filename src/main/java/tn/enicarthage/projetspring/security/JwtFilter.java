package tn.enicarthage.projetspring.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        System.out.println(">>> URI: " + request.getRequestURI());
        System.out.println(">>> Auth header: " + authHeader);

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            boolean valid = jwtUtil.validateToken(token);
            System.out.println(">>> Token valid: " + valid);

            if (valid) {
                String email = jwtUtil.extractEmail(token);
                System.out.println(">>> Email: " + email);

                try {
                    UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                    System.out.println(">>> Authorities: " + userDetails.getAuthorities());

                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails, null, userDetails.getAuthorities());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    System.out.println(">>> Auth set in SecurityContext ");

                } catch (Exception e) {
                    System.out.println(">>> loadUserByUsername FAILED: " + e.getMessage());
                }
            }
        } else {
            System.out.println(">>> No Bearer token found ");
        }

        filterChain.doFilter(request, response);
    }
}