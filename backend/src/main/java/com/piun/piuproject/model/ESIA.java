package com.piun.piuproject.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "esia")
public class ESIA {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;

    @ManyToOne
    @JoinColumn(name = "investment_type_code")
    private KPIForContract investmentType;

    @Column(name = "project_duration")
    private Integer projectDuration;

    @Column(name = "project_phase")
    private Integer projectPhase;

    @Column(name = "project_locations", length = 500)
    private String projectLocations;

    @Column(name = "number_of_communities")
    private Integer numberOfCommunities;

    @Column(name = "esia_findings", columnDefinition = "TEXT")
    private String esiaFindings;

    @Column(name = "date_created")
    private LocalDateTime dateCreated = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    public ESIA() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }
    public KPIForContract getInvestmentType() { return investmentType; }
    public void setInvestmentType(KPIForContract investmentType) { this.investmentType = investmentType; }
    public Integer getProjectDuration() { return projectDuration; }
    public void setProjectDuration(Integer projectDuration) { this.projectDuration = projectDuration; }
    public Integer getProjectPhase() { return projectPhase; }
    public void setProjectPhase(Integer projectPhase) { this.projectPhase = projectPhase; }
    public String getProjectLocations() { return projectLocations; }
    public void setProjectLocations(String projectLocations) { this.projectLocations = projectLocations; }
    public Integer getNumberOfCommunities() { return numberOfCommunities; }
    public void setNumberOfCommunities(Integer numberOfCommunities) { this.numberOfCommunities = numberOfCommunities; }
    public String getEsiaFindings() { return esiaFindings; }
    public void setEsiaFindings(String esiaFindings) { this.esiaFindings = esiaFindings; }
    public LocalDateTime getDateCreated() { return dateCreated; }
    public void setDateCreated(LocalDateTime dateCreated) { this.dateCreated = dateCreated; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}
