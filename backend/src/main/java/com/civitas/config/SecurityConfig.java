package com.civitas.config;
import com.civitas.model.User;
import com.civitas.repo.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.*;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {
  @Bean PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }

  @Bean UserDetailsService userDetailsService(UserRepository users) {
    return email -> users.findByEmailIgnoreCase(email)
        .map(u -> org.springframework.security.core.userdetails.User.withUsername(u.getEmail())
            .password(u.getPasswordHash()).roles(u.getRole().name()).build())
        .orElseThrow(() -> new UsernameNotFoundException("not found"));
  }
  @Bean AuthenticationManager authManager(AuthenticationConfiguration c) throws Exception { return c.getAuthenticationManager(); }

  // Session cookie auth (HttpOnly). Frontend and API share one origin via the nginx proxy.
  // CSRF is disabled for simplicity; enable CSRF tokens before any real deployment.
  @Bean SecurityFilterChain chain(HttpSecurity http) throws Exception {
    http.csrf(AbstractHttpConfigurer::disable)
      .authorizeHttpRequests(a -> a
        .requestMatchers("/actuator/health", "/api/auth/register", "/api/auth/login").permitAll()
        .requestMatchers(HttpMethod.GET, "/api/events/**", "/api/posters/**").permitAll()
        .requestMatchers("/api/organizer/**").hasRole("ORGANIZER")
        .anyRequest().authenticated())
      .exceptionHandling(e -> e.authenticationEntryPoint((q, s, x) -> s.sendError(401, "Please log in.")))
      .logout(l -> l.logoutUrl("/api/auth/logout").logoutSuccessHandler((q, s, a) -> s.setStatus(204)));
    return http.build();
  }
}
