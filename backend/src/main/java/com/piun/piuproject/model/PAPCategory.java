package com.piun.piuproject.model;

import jakarta.persistence.*;

@Entity
@Table(name = "pap_categories")
public class PAPCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "pap_category", length = 100, unique = true, nullable = false)
    private String papCategory;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    public PAPCategory() {}

    public PAPCategory(String papCategory) {
        this.papCategory = papCategory;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getPapCategory() { return papCategory; }
    public void setPapCategory(String papCategory) { this.papCategory = papCategory; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}
