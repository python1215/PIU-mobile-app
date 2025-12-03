package com.piun.piuproject.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "physical_progress")
public class PhysicalProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "progress_scale", length = 50, unique = true, nullable = false)
    private String progressScale;

    @Column(name = "date_created")
    private LocalDateTime dateCreated = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    public PhysicalProgress() {}

    public PhysicalProgress(String progressScale) {
        this.progressScale = progressScale;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getProgressScale() { return progressScale; }
    public void setProgressScale(String progressScale) { this.progressScale = progressScale; }
    public LocalDateTime getDateCreated() { return dateCreated; }
    public void setDateCreated(LocalDateTime dateCreated) { this.dateCreated = dateCreated; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}
