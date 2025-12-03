package com.piun.piuproject.controller;

import com.piun.piuproject.model.*;
import com.piun.piuproject.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin(origins = "*")
public class DocumentationController {

    @Autowired
    private ProjectDocumentRepository documentRepository;
    
    @Autowired
    private DocumentVersionRepository versionRepository;
    
    @Autowired
    private DocumentCommentRepository commentRepository;
    
    @Autowired
    private DocumentTagRepository tagRepository;

    @GetMapping
    public List<ProjectDocument> getAllDocuments() {
        return documentRepository.findAll();
    }

    @GetMapping("/project/{projectId}")
    public List<ProjectDocument> getDocumentsByProject(@PathVariable String projectId) {
        return documentRepository.findByProject_ProjectId(projectId);
    }

    @PostMapping
    public ProjectDocument createDocument(@RequestBody ProjectDocument document) {
        return documentRepository.save(document);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjectDocument> updateDocument(
            @PathVariable Long id, 
            @RequestBody ProjectDocument documentDetails) {
        return documentRepository.findById(id)
            .map(document -> {
                document.setDescription(documentDetails.getDescription());
                document.setDocumentDate(documentDetails.getDocumentDate());
                document.setAttachment(documentDetails.getAttachment());
                return ResponseEntity.ok(documentRepository.save(document));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long id) {
        return documentRepository.findById(id)
            .map(document -> {
                documentRepository.delete(document);
                return ResponseEntity.ok().<Void>build();
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{documentId}/versions")
    public List<DocumentVersion> getVersionsByDocument(@PathVariable Long documentId) {
        return versionRepository.findByDocument_Id(documentId);
    }

    @PostMapping("/{documentId}/versions")
    public ResponseEntity<DocumentVersion> createVersion(@PathVariable Long documentId, @RequestBody DocumentVersion version) {
        return documentRepository.findById(documentId)
            .map(document -> {
                version.setDocument(document);
                return ResponseEntity.ok(versionRepository.save(version));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{documentId}/comments")
    public List<DocumentComment> getCommentsByDocument(@PathVariable Long documentId) {
        return commentRepository.findByDocument_Id(documentId);
    }

    @PostMapping("/{documentId}/comments")
    public ResponseEntity<DocumentComment> createComment(@PathVariable Long documentId, @RequestBody DocumentComment comment) {
        return documentRepository.findById(documentId)
            .map(document -> {
                comment.setDocument(document);
                return ResponseEntity.ok(commentRepository.save(comment));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/comments/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id) {
        return commentRepository.findById(id)
            .map(comment -> {
                commentRepository.delete(comment);
                return ResponseEntity.ok().<Void>build();
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/tags")
    public List<DocumentTag> getAllTags() {
        return tagRepository.findAll();
    }

    @PostMapping("/tags")
    public DocumentTag createTag(@RequestBody DocumentTag tag) {
        return tagRepository.save(tag);
    }

    @DeleteMapping("/tags/{id}")
    public ResponseEntity<Void> deleteTag(@PathVariable Long id) {
        return tagRepository.findById(id)
            .map(tag -> {
                tagRepository.delete(tag);
                return ResponseEntity.ok().<Void>build();
            })
            .orElse(ResponseEntity.notFound().build());
    }
}
