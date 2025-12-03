package com.piun.piuproject.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "type_of_impact")
public class TypeOfImpact {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "impact", length = 150, unique = true, nullable = false)
    private String impact;

    @Column(name = "date_created")
    private LocalDateTime dateCreated = LocalDateTime.now();

    public TypeOfImpact() {}

    public TypeOfImpact(String impact) {
        this.impact = impact;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getImpact() { return impact; }
    public void setImpact(String impact) { this.impact = impact; }
    public LocalDateTime getDateCreated() { return dateCreated; }
    public void setDateCreated(LocalDateTime dateCreated) { this.dateCreated = dateCreated; }
}
