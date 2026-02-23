package com.deepika.DocumentSignatureApp.repository;

import com.deepika.DocumentSignatureApp.entity.Document;
import com.deepika.DocumentSignatureApp.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DocumentRepository extends JpaRepository<Document, Long> {
    // Allows a user to see all their uploaded documents
    List<Document> findByUser(User user);
}