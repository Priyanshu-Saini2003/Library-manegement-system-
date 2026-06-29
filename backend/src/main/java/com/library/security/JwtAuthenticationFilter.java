package com.library.security;

import com.library.model.Profile;
import com.library.repository.ProfileRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
  private final JwtService jwtService;
  private final ProfileRepository profileRepository;

  public JwtAuthenticationFilter(JwtService jwtService, ProfileRepository profileRepository) {
    this.jwtService = jwtService;
    this.profileRepository = profileRepository;
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request,
      HttpServletResponse response,
      FilterChain filterChain
  ) throws ServletException, IOException {
    String header = request.getHeader("Authorization");

    if (header == null || !header.startsWith("Bearer ")) {
      filterChain.doFilter(request, response);
      return;
    }

    String token = header.substring(7);
    try {
      if (jwtService.isValid(token)) {
        String email = jwtService.extractEmail(token);
        Profile profile = profileRepository.findByEmailIgnoreCase(email).orElse(null);
        if (profile != null) {
          var authorities = List.of(new SimpleGrantedAuthority("ROLE_" + profile.getRole().name()));
          var authentication = new UsernamePasswordAuthenticationToken(profile.getEmail(), null, authorities);
          authentication.setDetails(profile);
          SecurityContextHolder.getContext().setAuthentication(authentication);
        }
      }
    } catch (RuntimeException ignored) {
      SecurityContextHolder.clearContext();
    }

    filterChain.doFilter(request, response);
  }
}
