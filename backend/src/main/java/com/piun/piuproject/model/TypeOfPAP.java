package com.piun.piuproject.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "type_of_pap")
public class TypeOfPAP {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "type_of_pap", length = 70, unique = true, nullable = false)
    private String typeOfPap;

    @Column(name = "date_created")
    private LocalDateTime dateCreated = LocalDateTime.now();

    public TypeOfPAP() {}

    public TypeOfPAP(String typeOfPap) {
        this.typeOfPap = typeOfPap;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTypeOfPap() { return typeOfPap; }
    public void setTypeOfPap(String typeOfPap) { this.typeOfPap = typeOfPap; }
    public LocalDateTime getDateCreated() { return dateCreated; }
    public void setDateCreated(LocalDateTime dateCreated) { this.dateCreated = dateCreated; }
}
