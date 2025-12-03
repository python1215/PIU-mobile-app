package com.piun.piuproject.model;

import jakarta.persistence.*;

@Entity
@Table(name = "decision_outcomes")
public class DecisionOutcome {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "outcome", length = 50, unique = true, nullable = false)
    private String outcome;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    public DecisionOutcome() {}

    public DecisionOutcome(String outcome) {
        this.outcome = outcome;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getOutcome() { return outcome; }
    public void setOutcome(String outcome) { this.outcome = outcome; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}
