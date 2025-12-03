package com.piun.piuproject.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "document_comments")
public class DocumentComment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "document_id")
    private ProjectDocument document;

    @Column(name = "comment", columnDefinition = "TEXT")
    private String comment;

    @Column(name = "created_date")
    private LocalDateTime createdDate = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    public DocumentComment() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public ProjectDocument getDocument() { return document; }
    public void setDocument(ProjectDocument document) { this.document = document; }
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}
