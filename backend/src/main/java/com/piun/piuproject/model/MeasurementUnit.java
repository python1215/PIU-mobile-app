package com.piun.piuproject.model;

import jakarta.persistence.*;

@Entity
@Table(name = "measurement_units")
public class MeasurementUnit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "unit", length = 50, unique = true, nullable = false)
    private String unit;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    public MeasurementUnit() {}

    public MeasurementUnit(String unit) {
        this.unit = unit;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}
