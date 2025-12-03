package com.piun.piuproject.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 64)
    @Column(unique = true, nullable = false)
    private String username;

    @NotBlank
    @Email
    @Size(max = 120)
    @Column(unique = true, nullable = false)
    private String email;

    @NotBlank
    @Size(max = 256)
    private String passwordHash;

    @Size(max = 100)
    private String firstName;

    @Size(max = 100)
    private String lastName;

    @Size(max = 100)
    private String department;

    private boolean isActive = true;

    private boolean isSuperuser = false;

    @Column(name = "date_joined")
    private LocalDateTime dateJoined = LocalDateTime.now();

    @Column(name = "last_login")
    private LocalDateTime lastLogin;
}
