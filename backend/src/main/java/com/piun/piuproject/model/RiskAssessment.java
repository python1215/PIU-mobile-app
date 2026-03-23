package com.piun.piuproject.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "risk_assessment")
public class RiskAssessment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "risk_id", length = 50)
    private String riskId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "project_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Project project;

    @Column(name = "risk_category", length = 50)
    private String riskCategory;

    @Column(name = "risk_title", length = 255)
    private String riskTitle;

    @Column(name = "risk_description", columnDefinition = "TEXT")
    private String riskDescription;

    @Column(name = "likelihood", length = 20)
    private String likelihood;

    @Column(name = "impact", length = 20)
    private String impact;

    @Column(name = "risk_score")
    private Integer riskScore;

    @Column(name = "risk_level", length = 20)
    private String riskLevel;

    @Column(name = "status", length = 30)
    private String status;

    @Column(name = "identified_date")
    private LocalDate identifiedDate;

    @Column(name = "identified_by", length = 255)
    private String identifiedBy;

    @Column(name = "risk_owner", length = 255)
    private String riskOwner;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "source", length = 30)
    private String source;

    @Column(name = "date_created")
    private LocalDateTime dateCreated = LocalDateTime.now();

    public RiskAssessment() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getRiskId() { return riskId; }
    public void setRiskId(String riskId) { this.riskId = riskId; }
    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }
    public String getRiskCategory() { return riskCategory; }
    public void setRiskCategory(String riskCategory) { this.riskCategory = riskCategory; }
    public String getRiskTitle() { return riskTitle; }
    public void setRiskTitle(String riskTitle) { this.riskTitle = riskTitle; }
    public String getRiskDescription() { return riskDescription; }
    public void setRiskDescription(String riskDescription) { this.riskDescription = riskDescription; }
    public String getLikelihood() { return likelihood; }
    public void setLikelihood(String likelihood) { this.likelihood = likelihood; }
    public String getImpact() { return impact; }
    public void setImpact(String impact) { this.impact = impact; }
    public Integer getRiskScore() { return riskScore; }
    public void setRiskScore(Integer riskScore) { this.riskScore = riskScore; }
    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDate getIdentifiedDate() { return identifiedDate; }
    public void setIdentifiedDate(LocalDate identifiedDate) { this.identifiedDate = identifiedDate; }
    public String getIdentifiedBy() { return identifiedBy; }
    public void setIdentifiedBy(String identifiedBy) { this.identifiedBy = identifiedBy; }
    public String getRiskOwner() { return riskOwner; }
    public void setRiskOwner(String riskOwner) { this.riskOwner = riskOwner; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
    public LocalDateTime getDateCreated() { return dateCreated; }
    public void setDateCreated(LocalDateTime dateCreated) { this.dateCreated = dateCreated; }
}
