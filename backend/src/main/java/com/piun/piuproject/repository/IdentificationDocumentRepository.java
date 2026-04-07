package com.piun.piuproject.repository;

import com.piun.piuproject.model.IdentificationDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IdentificationDocumentRepository extends JpaRepository<IdentificationDocument, Long> {
}
