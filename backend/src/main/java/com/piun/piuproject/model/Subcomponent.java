package com.piun.piuproject.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "subcomponents")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Subcomponent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "subcomp_id")
    private Long subcompId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "comp_id", nullable = false)
    private Component component;

    @NotBlank
    @Column(length = 100)
    private String subcomponent;

    @Column(name = "subcomponent_description", length = 500)
    private String subcomponentDescription;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "currency_id")
    private Currency currency;

    @Column(precision = 12, scale = 2)
    private BigDecimal allocation;

    @Column(name = "date_created")
    private LocalDateTime dateCreated = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "login_user_id", nullable = false)
    private User loginUser;
}
