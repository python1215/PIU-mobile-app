package com.piun.piuproject.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "stakeholder_engagements")
public class StakeholderEngagement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "engagement_type", length = 150, nullable = false)
    private String engagementType;

    @Column(name = "date_created")
    private LocalDateTime dateCreated = LocalDateTime.now();

    public StakeholderEngagement() {}

    public StakeholderEngagement(String engagementType) {
        this.engagementType = engagementType;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getEngagementType() { return engagementType; }
    public void setEngagementType(String engagementType) { this.engagementType = engagementType; }
    public LocalDateTime getDateCreated() { return dateCreated; }
    public void setDateCreated(LocalDateTime dateCreated) { this.dateCreated = dateCreated; }
}
