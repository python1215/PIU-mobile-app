package com.piun.piuproject.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "project_results")
public class ProjectResult {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "project_outcome_id")
    private ProjectOutcome projectOutcome;

    @Column(name = "project_result", length = 500, unique = true, nullable = false)
    private String projectResult;

    @Column(name = "date_created")
    private LocalDateTime dateCreated = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    public ProjectResult() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public ProjectOutcome getProjectOutcome() { return projectOutcome; }
    public void setProjectOutcome(ProjectOutcome projectOutcome) { this.projectOutcome = projectOutcome; }
    public String getProjectResult() { return projectResult; }
    public void setProjectResult(String projectResult) { this.projectResult = projectResult; }
    public LocalDateTime getDateCreated() { return dateCreated; }
    public void setDateCreated(LocalDateTime dateCreated) { this.dateCreated = dateCreated; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}
