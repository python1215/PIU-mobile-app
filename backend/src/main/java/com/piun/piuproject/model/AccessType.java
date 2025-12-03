package com.piun.piuproject.model;

import jakarta.persistence.*;

@Entity
@Table(name = "access_types")
public class AccessType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "access_type", length = 50, unique = true, nullable = false)
    private String accessType;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    public AccessType() {}

    public AccessType(String accessType) {
        this.accessType = accessType;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getAccessType() { return accessType; }
    public void setAccessType(String accessType) { this.accessType = accessType; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}
