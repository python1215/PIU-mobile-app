package com.piun.piuproject.model;

import jakarta.persistence.*;

@Entity
@Table(name = "settlement_natures")
public class SettlementNature {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nature_of_settlement", length = 50, unique = true, nullable = false)
    private String natureOfSettlement;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    public SettlementNature() {}

    public SettlementNature(String natureOfSettlement) {
        this.natureOfSettlement = natureOfSettlement;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNatureOfSettlement() { return natureOfSettlement; }
    public void setNatureOfSettlement(String natureOfSettlement) { this.natureOfSettlement = natureOfSettlement; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}
