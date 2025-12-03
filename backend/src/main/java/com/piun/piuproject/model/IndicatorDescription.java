package com.piun.piuproject.model;

import jakarta.persistence.*;

@Entity
@Table(name = "indicator_descriptions")
public class IndicatorDescription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;

    @ManyToOne
    @JoinColumn(name = "pdo_id")
    private PDO pdo;

    @ManyToOne
    @JoinColumn(name = "project_outcome_id")
    private ProjectOutcome projectOutcome;

    @ManyToOne
    @JoinColumn(name = "project_result_id")
    private ProjectResult projectResult;

    @ManyToOne
    @JoinColumn(name = "indicator_type_id")
    private IndicatorType indicatorType;

    @Column(name = "indicator_description", length = 500)
    private String indicatorDescription;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    public IndicatorDescription() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }
    public PDO getPdo() { return pdo; }
    public void setPdo(PDO pdo) { this.pdo = pdo; }
    public ProjectOutcome getProjectOutcome() { return projectOutcome; }
    public void setProjectOutcome(ProjectOutcome projectOutcome) { this.projectOutcome = projectOutcome; }
    public ProjectResult getProjectResult() { return projectResult; }
    public void setProjectResult(ProjectResult projectResult) { this.projectResult = projectResult; }
    public IndicatorType getIndicatorType() { return indicatorType; }
    public void setIndicatorType(IndicatorType indicatorType) { this.indicatorType = indicatorType; }
    public String getIndicatorDescription() { return indicatorDescription; }
    public void setIndicatorDescription(String indicatorDescription) { this.indicatorDescription = indicatorDescription; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}
