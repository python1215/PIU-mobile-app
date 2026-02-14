package com.piun.piuproject.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
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
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Project {
    @Id
    @Column(name = "project_id", length = 15)
    @EqualsAndHashCode.Include
    private String projectId;

    @NotBlank
    @Column(unique = true, nullable = false, length = 200)
    private String project;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "currency_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Currency currency;

    @Column(precision = 12, scale = 2)
    private BigDecimal funding;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "project_donors",
        joinColumns = @JoinColumn(name = "project_id"),
        inverseJoinColumns = @JoinColumn(name = "donor_id")
    )
    private Set<Donor> donors = new HashSet<>();

    @ManyToMany(fetch = FetchType.EAGER)
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
    @JsonIgnore
    private User loginUser;
}
