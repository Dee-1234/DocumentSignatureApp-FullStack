package com.deepika.DocumentSignatureApp.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Document {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fileName;
    private String filePath; // The path where the physical file is saved
    private String fileType; // e.g., "application/pdf"

    @Enumerated(EnumType.STRING)
    private DocumentStatus status; // PENDING, SIGNED, REJECTED

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) status = DocumentStatus.PENDING;
    }
}

