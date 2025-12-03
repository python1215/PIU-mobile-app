package com.piun.piuproject.model;

import jakarta.persistence.*;

@Entity
@Table(name = "impact_types")
public class ImpactType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "impact", length = 150, unique = true, nullable = false)
    private String impact;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    public ImpactType() {}

    public ImpactType(String impact) {
        this.impact = impact;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getImpact() { return impact; }
    public void setImpact(String impact) { this.impact = impact; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}
