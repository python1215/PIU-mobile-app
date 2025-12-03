package com.piun.piuproject.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "document_versions")
public class DocumentVersion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "document_id")
    private ProjectDocument document;

    @Column(name = "version", length = 10)
    private String version = "1.0";

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "attachment", length = 255)
    private String attachment;

    @Column(name = "created_date")
    private LocalDateTime createdDate = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    public DocumentVersion() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public ProjectDocument getDocument() { return document; }
    public void setDocument(ProjectDocument document) { this.document = document; }
    public String getVersion() { return version; }
    public void setVersion(String version) { this.version = version; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getAttachment() { return attachment; }
    public void setAttachment(String attachment) { this.attachment = attachment; }
    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}
