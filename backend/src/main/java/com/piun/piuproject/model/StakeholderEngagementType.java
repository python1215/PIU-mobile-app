package com.piun.piuproject.model;

import jakarta.persistence.*;

@Entity
@Table(name = "stakeholder_engagement_types")
public class StakeholderEngagementType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "engagement_type", length = 150, unique = true, nullable = false)
    private String engagementType;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    public StakeholderEngagementType() {}

    public StakeholderEngagementType(String engagementType) {
        this.engagementType = engagementType;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getEngagementType() { return engagementType; }
    public void setEngagementType(String engagementType) { this.engagementType = engagementType; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}
