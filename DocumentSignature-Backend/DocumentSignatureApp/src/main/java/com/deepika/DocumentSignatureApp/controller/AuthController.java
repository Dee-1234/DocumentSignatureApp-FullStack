package com.deepika.DocumentSignatureApp.controller;

import com.deepika.DocumentSignatureApp.dto.AuthResponse;
import com.deepika.DocumentSignatureApp.dto.LoginRequest;
import com.deepika.DocumentSignatureApp.dto.RegisterRequest;
import com.deepika.DocumentSignatureApp.entity.User;
import com.deepika.DocumentSignatureApp.repository.UserRepository;
import com.deepika.DocumentSignatureApp.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", maxAge = 3600)
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    /*@PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request) {
        // Check if user already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body("Error: Email is already in use!");
        }

        var user = User.builder()
                .email(request.getEmail())
                // Ensure your RegisterRequest has a getUsername() method
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(com.deepika.DocumentSignatureApp.entity.Role.USER)
                .build();

        userRepository.save(user);

        return ResponseEntity.ok("User registered successfully");
    }*/

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request) {
        // PRINT TO CONSOLE TO SEE THE TRUTH
        System.out.println("DEBUG: Received Role String: " + request.getRole());

        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body("Error: Email is already in use!");
        }

        // Explicitly check the string
        com.deepika.DocumentSignatureApp.entity.Role targetRole;

        if (request.getRole() != null && request.getRole().equalsIgnoreCase("ADMIN")) {
            targetRole = com.deepika.DocumentSignatureApp.entity.Role.ADMIN;
            System.out.println("DEBUG: Logic matched ADMIN");
        } else {
            targetRole = com.deepika.DocumentSignatureApp.entity.Role.USER;
            System.out.println("DEBUG: Logic defaulted to USER");
        }

        var user = User.builder()
                .email(request.getEmail())
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(targetRole)
                .build();

        userRepository.save(user);
        return ResponseEntity.ok("User registered successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> authenticate(@RequestBody LoginRequest request) {
        // request.getIdentifier() could be "deepika" or "deepika@mail.com"
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getIdentifier(),
                        request.getPassword()
                )
        );

        var user = userRepository.findByUsernameOrEmail(request.getIdentifier(), request.getIdentifier())
                .orElseThrow();

        var jwtToken = jwtService.generateToken(user);
        return ResponseEntity.ok(AuthResponse.builder().token(jwtToken).build());
    }
}