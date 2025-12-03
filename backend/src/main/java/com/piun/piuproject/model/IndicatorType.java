package com.piun.piuproject.model;

import jakarta.persistence.*;

@Entity
@Table(name = "indicator_types")
public class IndicatorType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "indicator_type", length = 500, unique = true, nullable = false)
    private String indicatorType;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    public IndicatorType() {}

    public IndicatorType(String indicatorType) {
        this.indicatorType = indicatorType;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getIndicatorType() { return indicatorType; }
    public void setIndicatorType(String indicatorType) { this.indicatorType = indicatorType; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}
