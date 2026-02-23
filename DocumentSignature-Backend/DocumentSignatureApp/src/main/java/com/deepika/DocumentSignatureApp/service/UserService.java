package com.deepika.DocumentSignatureApp.service;

import com.deepika.DocumentSignatureApp.dto.RegisterRequest;
import com.deepika.DocumentSignatureApp.entity.Role;
import com.deepika.DocumentSignatureApp.entity.User;
import com.deepika.DocumentSignatureApp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public User register(RegisterRequest request) {
        // 1. Check if user already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        // 2. Create new User entity
        User user = User.builder()
                .email(request.getEmail())
                // IMPORTANT: Always encode the password before saving
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole() != null ? Role.valueOf(request.getRole()) : Role.USER)
                .build();

        // 3. Save to MySQL
        return userRepository.save(user);
    }
}