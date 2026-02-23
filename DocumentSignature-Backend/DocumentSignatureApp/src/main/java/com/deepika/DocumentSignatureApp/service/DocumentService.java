package com.deepika.DocumentSignatureApp.service;

import com.deepika.DocumentSignatureApp.entity.Document;
import com.deepika.DocumentSignatureApp.entity.User;
import com.deepika.DocumentSignatureApp.repository.DocumentRepository;
import com.itextpdf.kernel.pdf.PdfReader;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.VerticalAlignment;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.itextpdf.kernel.pdf.PdfDocument;


import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepository;

    @Value("${app.upload.dir}")
    private String uploadDir;

    public Document saveDocument(MultipartFile file, User user) throws IOException {
        // 1. Create directory if it doesn't exist
        Path root = Paths.get(uploadDir);
        if (!Files.exists(root)) {
            Files.createDirectories(root);
        }

        // 2. Generate unique filename to prevent overwrites
        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path targetPath = root.resolve(fileName);

        // 3. Save file to disk
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        // 4. Save metadata to Database
        Document document = Document.builder()
                .fileName(file.getOriginalFilename())
                .filePath(targetPath.toString())
                .fileType(file.getContentType())
                .user(user)
                .build();

        return documentRepository.save(document);
    }

    public void signDocument(Long documentId, String nameToPrint) throws IOException {
        com.deepika.DocumentSignatureApp.entity.Document docEntity =
                documentRepository.findById(documentId)
                        .orElseThrow(() -> new RuntimeException("Document not found"));

        String originalPath = docEntity.getFilePath();
        String signedPath = originalPath.replace(".pdf", "_signed_" + System.currentTimeMillis() + ".pdf");

        try (PdfReader reader = new PdfReader(originalPath);
             PdfWriter writer = new PdfWriter(signedPath);
             PdfDocument pdfDoc = new PdfDocument(reader, writer)) {

            com.itextpdf.layout.Document iTextDoc = new com.itextpdf.layout.Document(pdfDoc);

            // This now uses the custom name typed in the React prompt!
            Paragraph footer = new Paragraph("Digitally Signed by: " + nameToPrint +
                    "\nDate: " + java.time.LocalDate.now())
                    .setTextAlignment(TextAlignment.RIGHT)
                    .setFontSize(10);

            float x = pdfDoc.getDefaultPageSize().getWidth() - 50;
            float y = 50;

            iTextDoc.showTextAligned(footer, x, y, pdfDoc.getNumberOfPages(),
                    TextAlignment.RIGHT, VerticalAlignment.BOTTOM, 0);

            iTextDoc.close();
        }

        docEntity.setFilePath(signedPath);
        docEntity.setStatus(com.deepika.DocumentSignatureApp.entity.DocumentStatus.SIGNED);
        documentRepository.save(docEntity);
    }

    }
