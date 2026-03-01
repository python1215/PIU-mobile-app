package com.piun.piuproject.config;

import com.piun.piuproject.model.User;
import com.piun.piuproject.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataInitializer implements ApplicationRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        try {
            if (!userRepository.existsByUsername("admin")) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setEmail("admin@romeot.net");
                admin.setPasswordHash(passwordEncoder.encode("admin123"));
                admin.setFirstName("Admin");
                admin.setLastName("System");
                admin.setActive(true);
                admin.setSuperuser(true);
                admin.setDateJoined(LocalDateTime.now());
                userRepository.save(admin);
                logger.info("Superuser 'admin' created successfully");
            } else {
                User admin = userRepository.findByUsername("admin").orElse(null);
                if (admin != null && !admin.isSuperuser()) {
                    admin.setSuperuser(true);
                    userRepository.save(admin);
                    logger.info("Existing 'admin' user promoted to superuser");
                } else {
                    logger.info("Superuser 'admin' already exists");
                }
            }
        } catch (Exception e) {
            logger.warn("Could not initialize superuser (database may not be ready yet): {}", e.getMessage());
        }
    }
}
