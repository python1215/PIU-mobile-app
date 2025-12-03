package com.piun.piuproject.model;

import jakarta.persistence.*;

@Entity
@Table(name = "data_collection_frequencies")
public class DataCollectionFrequency {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "frequency", length = 50, unique = true, nullable = false)
    private String frequency;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    public DataCollectionFrequency() {}

    public DataCollectionFrequency(String frequency) {
        this.frequency = frequency;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getFrequency() { return frequency; }
    public void setFrequency(String frequency) { this.frequency = frequency; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}
