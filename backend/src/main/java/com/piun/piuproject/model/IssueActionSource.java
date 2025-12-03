package com.piun.piuproject.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "issue_action_sources")
public class IssueActionSource {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "issue_action_source", length = 100, unique = true, nullable = false)
    private String issueActionSource;

    @Column(name = "date_created")
    private LocalDateTime dateCreated = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    public IssueActionSource() {}

    public IssueActionSource(String issueActionSource) {
        this.issueActionSource = issueActionSource;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getIssueActionSource() { return issueActionSource; }
    public void setIssueActionSource(String issueActionSource) { this.issueActionSource = issueActionSource; }
    public LocalDateTime getDateCreated() { return dateCreated; }
    public void setDateCreated(LocalDateTime dateCreated) { this.dateCreated = dateCreated; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}
