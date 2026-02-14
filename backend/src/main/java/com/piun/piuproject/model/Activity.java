package com.piun.piuproject.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "activities")
public class Activity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "activity_id")
    private Long activityId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "year_id")
    private Year year;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "project_id")
    private Project project;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "component_id")
    private Component component;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "subcomponent_id")
    private Subcomponent subcomponent;

    @Column(name = "activity", length = 500, unique = true)
    private String activity;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "currency_id")
    private Currency currency;

    @Column(name = "allocation", precision = 12, scale = 2)
    private BigDecimal allocation;

    @Column(name = "date_created")
    private LocalDateTime dateCreated = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    private User user;

    public Activity() {}

    public Long getActivityId() { return activityId; }
    public void setActivityId(Long activityId) { this.activityId = activityId; }
    public Year getYear() { return year; }
    public void setYear(Year year) { this.year = year; }
    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }
    public Component getComponent() { return component; }
    public void setComponent(Component component) { this.component = component; }
    public Subcomponent getSubcomponent() { return subcomponent; }
    public void setSubcomponent(Subcomponent subcomponent) { this.subcomponent = subcomponent; }
    public String getActivity() { return activity; }
    public void setActivity(String activity) { this.activity = activity; }
    public Currency getCurrency() { return currency; }
    public void setCurrency(Currency currency) { this.currency = currency; }
    public BigDecimal getAllocation() { return allocation; }
    public void setAllocation(BigDecimal allocation) { this.allocation = allocation; }
    public LocalDateTime getDateCreated() { return dateCreated; }
    public void setDateCreated(LocalDateTime dateCreated) { this.dateCreated = dateCreated; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}
