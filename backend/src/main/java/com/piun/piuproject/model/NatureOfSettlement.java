package com.piun.piuproject.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "nature_of_settlement")
public class NatureOfSettlement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nature_of_settlement", length = 50, unique = true, nullable = false)
    private String natureOfSettlement;

    @Column(name = "date_created")
    private LocalDateTime dateCreated = LocalDateTime.now();

    public NatureOfSettlement() {}

    public NatureOfSettlement(String natureOfSettlement) {
        this.natureOfSettlement = natureOfSettlement;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNatureOfSettlement() { return natureOfSettlement; }
    public void setNatureOfSettlement(String natureOfSettlement) { this.natureOfSettlement = natureOfSettlement; }
    public LocalDateTime getDateCreated() { return dateCreated; }
    public void setDateCreated(LocalDateTime dateCreated) { this.dateCreated = dateCreated; }
}
