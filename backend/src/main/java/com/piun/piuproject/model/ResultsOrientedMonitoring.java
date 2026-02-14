package com.piun.piuproject.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "results_oriented_monitoring")
public class ResultsOrientedMonitoring {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "year_id")
    private Year year;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "quarter_id")
    private Quarter quarter;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "project_id")
    private Project project;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "pdo_id")
    private PDO pdo;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "project_outcome_id")
    private ProjectOutcome projectOutcome;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "project_result_id")
    private ProjectResult projectResult;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "indicator_type_id")
    private IndicatorType indicatorType;

    @Column(name = "indicator_description", columnDefinition = "TEXT")
    private String indicatorDescription;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "measurement_unit_id")
    private MeasurementUnit measurementUnit;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "collection_frequency_id")
    private DataCollectionFrequency collectionFrequency;

    @Column(name = "baseline_value")
    private Double baselineValue;

    @Column(name = "achieved_value")
    private Double achievedValue;

    @Column(name = "end_target_value")
    private Double endTargetValue;

    @Column(name = "percentage_achieved_vs_baseline")
    private Double percentageAchievedVsBaseline;

    @Column(name = "percentage_achieved_vs_end_target")
    private Double percentageAchievedVsEndTarget;

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "date_created")
    private LocalDateTime dateCreated = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    private User user;

    public ResultsOrientedMonitoring() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Year getYear() { return year; }
    public void setYear(Year year) { this.year = year; }
    public Quarter getQuarter() { return quarter; }
    public void setQuarter(Quarter quarter) { this.quarter = quarter; }
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
    public MeasurementUnit getMeasurementUnit() { return measurementUnit; }
    public void setMeasurementUnit(MeasurementUnit measurementUnit) { this.measurementUnit = measurementUnit; }
    public DataCollectionFrequency getCollectionFrequency() { return collectionFrequency; }
    public void setCollectionFrequency(DataCollectionFrequency collectionFrequency) { this.collectionFrequency = collectionFrequency; }
    public Double getBaselineValue() { return baselineValue; }
    public void setBaselineValue(Double baselineValue) { this.baselineValue = baselineValue; }
    public Double getAchievedValue() { return achievedValue; }
    public void setAchievedValue(Double achievedValue) { this.achievedValue = achievedValue; }
    public Double getEndTargetValue() { return endTargetValue; }
    public void setEndTargetValue(Double endTargetValue) { this.endTargetValue = endTargetValue; }
    public Double getPercentageAchievedVsBaseline() { return percentageAchievedVsBaseline; }
    public void setPercentageAchievedVsBaseline(Double percentageAchievedVsBaseline) { this.percentageAchievedVsBaseline = percentageAchievedVsBaseline; }
    public Double getPercentageAchievedVsEndTarget() { return percentageAchievedVsEndTarget; }
    public void setPercentageAchievedVsEndTarget(Double percentageAchievedVsEndTarget) { this.percentageAchievedVsEndTarget = percentageAchievedVsEndTarget; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
    public LocalDateTime getDateCreated() { return dateCreated; }
    public void setDateCreated(LocalDateTime dateCreated) { this.dateCreated = dateCreated; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}
