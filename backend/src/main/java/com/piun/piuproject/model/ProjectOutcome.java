package com.piun.piuproject.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "project_outcomes")
public class ProjectOutcome {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "pdo_id")
    private PDO pdo;

    @Column(name = "project_outcome", length = 500, unique = true, nullable = false)
    private String projectOutcome;

    @Column(name = "date_created")
    private LocalDateTime dateCreated = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    public ProjectOutcome() {}

    public ProjectOutcome(PDO pdo, String projectOutcome) {
        this.pdo = pdo;
        this.projectOutcome = projectOutcome;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public PDO getPdo() { return pdo; }
    public void setPdo(PDO pdo) { this.pdo = pdo; }
    public String getProjectOutcome() { return projectOutcome; }
    public void setProjectOutcome(String projectOutcome) { this.projectOutcome = projectOutcome; }
    public LocalDateTime getDateCreated() { return dateCreated; }
    public void setDateCreated(LocalDateTime dateCreated) { this.dateCreated = dateCreated; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}
