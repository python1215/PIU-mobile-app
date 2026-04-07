package com.piun.piuproject.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "identification_documents")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class IdentificationDocument {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "doc_id", unique = true, nullable = false, length = 50)
    private String docId;

    @NotBlank
    @Column(name = "identity_document", nullable = false)
    private String identityDocument;

    @Column(name = "date_created")
    private LocalDateTime dateCreated = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "login_user_id")
    private User loginUser;
}
