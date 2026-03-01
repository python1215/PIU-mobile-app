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
            ensureSuperuser("admin", "admin@romeot.net", "admin123", "Admin", "System");
            ensureSuperuser("superadmin", "superadmin@romeot.net", "Admin@2025", "Super", "Admin");
        } catch (Exception e) {
            logger.warn("Could not initialize superusers (database may not be ready yet): {}", e.getMessage());
        }
    }

    private void ensureSuperuser(String username, String email, String password, String firstName, String lastName) {
        if (!userRepository.existsByUsername(username)) {
            User user = new User();
            user.setUsername(username);
            user.setEmail(email);
            user.setPasswordHash(passwordEncoder.encode(password));
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setActive(true);
            user.setSuperuser(true);
            user.setDateJoined(LocalDateTime.now());
            userRepository.save(user);
            logger.info("Superuser '{}' created successfully", username);
        } else {
            User user = userRepository.findByUsername(username).orElse(null);
            if (user != null && !user.isSuperuser()) {
                user.setSuperuser(true);
                userRepository.save(user);
                logger.info("Existing '{}' user promoted to superuser", username);
            } else {
                logger.info("Superuser '{}' already exists", username);
            }
        }
    }
}
