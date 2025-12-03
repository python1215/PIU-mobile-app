package com.piun.piuproject.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "monitoring_types")
public class MonitoringType {
    @Id
    @Column(name = "monitoring_type_code", length = 10)
    private String monitoringTypeCode;

    @Column(name = "monitoring_type", length = 50, unique = true, nullable = false)
    private String monitoringType;

    @Column(name = "date_created")
    private LocalDateTime dateCreated = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    public MonitoringType() {}

    public MonitoringType(String monitoringTypeCode, String monitoringType) {
        this.monitoringTypeCode = monitoringTypeCode;
        this.monitoringType = monitoringType;
    }

    public String getMonitoringTypeCode() { return monitoringTypeCode; }
    public void setMonitoringTypeCode(String monitoringTypeCode) { this.monitoringTypeCode = monitoringTypeCode; }
    public String getMonitoringType() { return monitoringType; }
    public void setMonitoringType(String monitoringType) { this.monitoringType = monitoringType; }
    public LocalDateTime getDateCreated() { return dateCreated; }
    public void setDateCreated(LocalDateTime dateCreated) { this.dateCreated = dateCreated; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}
