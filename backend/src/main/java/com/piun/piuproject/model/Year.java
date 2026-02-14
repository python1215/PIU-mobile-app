package com.piun.piuproject.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "years")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Year {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "profile_year", unique = true, nullable = false, length = 4)
    private String profileYear;

    @Column(name = "date_created")
    private LocalDateTime dateCreated = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "login_user_id", nullable = false)
    private User loginUser;
}
