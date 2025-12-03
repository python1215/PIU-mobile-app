package com.piun.piuproject.controller;

import com.piun.piuproject.model.Donor;
import com.piun.piuproject.model.User;
import com.piun.piuproject.repository.DonorRepository;
import com.piun.piuproject.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/donors")
@RequiredArgsConstructor
public class DonorController {

    private final DonorRepository donorRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Donor>> getAllDonors() {
        return ResponseEntity.ok(donorRepository.findAllByOrderByDateCreatedDesc());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Donor> getDonor(@PathVariable Long id) {
        return donorRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Donor> createDonor(@RequestBody Donor donor,
                                              @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        donor.setLoginUser(user);
        donor.setDateCreated(LocalDateTime.now());
        
        return ResponseEntity.ok(donorRepository.save(donor));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Donor> updateDonor(@PathVariable Long id, @RequestBody Donor donorDetails) {
        return donorRepository.findById(id)
            .map(donor -> {
                donor.setName(donorDetails.getName());
                return ResponseEntity.ok(donorRepository.save(donor));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDonor(@PathVariable Long id) {
        return donorRepository.findById(id)
            .map(donor -> {
                donorRepository.delete(donor);
                return ResponseEntity.ok().build();
            })
            .orElse(ResponseEntity.notFound().build());
    }
}
