package com.piun.piuproject.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "esia")
public class ESIA {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "esia_id", length = 50)
    private String esiaId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "project_id")
    private Project project;

    @Column(name = "type_of_investment", length = 255)
    private String typeOfInvestment;

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

    public ESIA() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getEsiaId() { return esiaId; }
    public void setEsiaId(String esiaId) { this.esiaId = esiaId; }
    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }
    public String getTypeOfInvestment() { return typeOfInvestment; }
    public void setTypeOfInvestment(String typeOfInvestment) { this.typeOfInvestment = typeOfInvestment; }
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
}
