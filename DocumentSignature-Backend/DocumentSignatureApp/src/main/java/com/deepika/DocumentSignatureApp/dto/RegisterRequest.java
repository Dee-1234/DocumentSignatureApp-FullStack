package com.deepika.DocumentSignatureApp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {
    private String username;
    private String email;
    private String password;
    private String role; // "USER" or "ADMIN"

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}