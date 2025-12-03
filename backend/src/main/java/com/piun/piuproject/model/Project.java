package com.piun.piuproject.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "projects")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Project {
    @Id
    @Column(name = "project_id", length = 15)
    private String projectId;

    @NotBlank
    @Column(unique = true, nullable = false, length = 200)
    private String project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "currency_id")
    private Currency currency;

    @Column(precision = 12, scale = 2)
    private BigDecimal funding;

    @ManyToMany
    @JoinTable(
        name = "project_donors",
        joinColumns = @JoinColumn(name = "project_id"),
        inverseJoinColumns = @JoinColumn(name = "donor_id")
    )
    private Set<Donor> donors = new HashSet<>();

    @ManyToMany
    @JoinTable(
        name = "project_contributors",
        joinColumns = @JoinColumn(name = "project_id"),
        inverseJoinColumns = @JoinColumn(name = "contributor_id")
    )
    private Set<Contributor> contributors = new HashSet<>();

    @Column(name = "effectiveness_date")
    private LocalDate effectivenessDate;

    @Column(name = "closure_date")
    private LocalDate closureDate;

    @Column(name = "last_date_of_disbursement")
    private LocalDate lastDateOfDisbursement;

    @Column(name = "date_created")
    private LocalDateTime dateCreated = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "login_user_id", nullable = false)
    private User loginUser;
}
