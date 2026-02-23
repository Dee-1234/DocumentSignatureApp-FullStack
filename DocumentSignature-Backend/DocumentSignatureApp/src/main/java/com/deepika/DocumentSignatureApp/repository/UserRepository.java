package com.deepika.DocumentSignatureApp.repository;


import com.deepika.DocumentSignatureApp.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsernameOrEmail(String username, String email);
    Optional<User> findByEmail(String email);
    Boolean existsByEmail(String email);
    Boolean existsByUsername(String username);
}