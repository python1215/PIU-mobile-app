package com.piun.piuproject.model;

import jakarta.persistence.*;

@Entity
@Table(name = "investment_types")
public class InvestmentType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name_of_investment", length = 100, unique = true, nullable = false)
    private String nameOfInvestment;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    public InvestmentType() {}

    public InvestmentType(String nameOfInvestment) {
        this.nameOfInvestment = nameOfInvestment;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNameOfInvestment() { return nameOfInvestment; }
    public void setNameOfInvestment(String nameOfInvestment) { this.nameOfInvestment = nameOfInvestment; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}
