package com.deepika.DocumentSignatureApp.controller;

import com.deepika.DocumentSignatureApp.entity.Document;
import com.deepika.DocumentSignatureApp.entity.DocumentStatus;
import com.deepika.DocumentSignatureApp.entity.Role;
import com.deepika.DocumentSignatureApp.entity.User;
import com.deepika.DocumentSignatureApp.repository.DocumentRepository;
import com.deepika.DocumentSignatureApp.repository.UserRepository;
import com.deepika.DocumentSignatureApp.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", maxAge = 3600, allowCredentials = "true")
public class DocumentController {

    private final DocumentService documentService;
    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal User currentUser // Automatically gets the user from the JWT
    ) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("Please select a file to upload.");
            }

            // Check if it's a PDF
            if (!"application/pdf".equals(file.getContentType())) {
                return ResponseEntity.badRequest().body("Only PDF files are allowed.");
            }

            Document savedDoc = documentService.saveDocument(file, currentUser);
            return ResponseEntity.ok("Document uploaded successfully! ID: " + savedDoc.getId());

        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Could not upload file: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/sign")
    public ResponseEntity<?> signDocument(
            @PathVariable Long id,
            @RequestParam(required = false) String customName,
            @AuthenticationPrincipal User currentUser
    ) {
        try {
            // Fallback logic: Use customName if provided, otherwise use username/email
            String nameToPrint = (customName != null && !customName.isEmpty())
                    ? customName
                    : currentUser.getUsername();

            documentService.signDocument(id, nameToPrint);

            return ResponseEntity.ok("Document signed successfully as: " + nameToPrint);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Error signing document: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<?> rejectDocument(@PathVariable Long id) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found"));
        doc.setStatus(DocumentStatus.REJECTED);
        documentRepository.save(doc);
        return ResponseEntity.ok("Document rejected.");
    }

    /*@DeleteMapping("/delete/{id}")
// Removed @PreAuthorize for now to fix the 403 issue
    public ResponseEntity<?> deleteDocument(@PathVariable Long id) {
        return documentRepository.findById(id)
                .map(doc -> {
                    // Option A: Hard Delete (Removes from DB)
                    // documentRepository.delete(doc);

                    // Option B: Soft Delete (Better for your status logic)
                    doc.setStatus(DocumentStatus.DELETED);
                    documentRepository.save(doc);

                    return ResponseEntity.ok("Document deleted successfully!");
                })
                .orElse(ResponseEntity.notFound().build());
    }*/

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteDocument(@PathVariable Long id, Authentication authentication) {
        // 1. Get the current logged-in user
        String email = authentication.getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return documentRepository.findById(id)
                .map(doc -> {
                    // 2. THE SECURITY CHECK
                    boolean isAdmin = currentUser.getRole() == Role.ADMIN;
                    boolean isOwner = doc.getUser().getId().equals(currentUser.getId());

                    if (isAdmin || isOwner) {
                        // Soft Delete logic
                        doc.setStatus(DocumentStatus.DELETED);
                        documentRepository.save(doc);
                        return ResponseEntity.ok("Document deleted successfully");
                    } else {
                        // 3. Unauthorized attempt
                        return ResponseEntity.status(403).body("You can only delete your own documents!");
                    }
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadDocument(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        try {
            com.deepika.DocumentSignatureApp.entity.Document document =
                    documentRepository.findById(id)
                            .orElseThrow(() -> new RuntimeException("Document not found"));

            Path path = Paths.get(document.getFilePath());
            Resource resource = new UrlResource(path.toUri());

            // Make sure we use the original filename or add .pdf
            String filename = document.getFileName();
            if (!filename.toLowerCase().endsWith(".pdf")) {
                filename += ".pdf";
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    // 'attachment' forces download, 'inline' tries to open in browser
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .body(resource);

        } catch (Exception e) {
            // If it fails, return the error so we can read it in Postman
            return ResponseEntity.internalServerError().build();
        }
    }
    @GetMapping
    public ResponseEntity<List<Document>> getAllDocuments(Authentication authentication) {
        // 1. Get current user details from security context
        User currentUser = (User) authentication.getPrincipal();

        if (currentUser.getRole().name().equals("ADMIN")) {
            // ADMIN sees everything
            return ResponseEntity.ok(documentRepository.findAll());
        } else {
            // USER sees only their documents
            // NOTE: You must have a 'user' field in your Document entity
            return ResponseEntity.ok(documentRepository.findByUser(currentUser));
        }
    }

    /*@GetMapping
    public ResponseEntity<?> getAllUserDocuments(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(documentRepository.findByUser(user));
    }*/
}