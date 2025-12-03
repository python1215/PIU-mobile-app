package com.piun.piuproject.model;

import jakarta.persistence.*;

@Entity
@Table(name = "pap_types")
public class PAPType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "type_of_pap", length = 100, unique = true, nullable = false)
    private String typeOfPap;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    public PAPType() {}

    public PAPType(String typeOfPap) {
        this.typeOfPap = typeOfPap;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTypeOfPap() { return typeOfPap; }
    public void setTypeOfPap(String typeOfPap) { this.typeOfPap = typeOfPap; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}
