package com.piun.piuproject.config;

import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;
import java.sql.Connection;

@Configuration
public class DatabaseConfig {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseConfig.class);

    @Bean
    @Primary
    public DataSource dataSource() {
        HikariDataSource dataSource = new HikariDataSource();

        String jdbcUrl = null;
        String username = null;
        String password = null;

        String pgHost = System.getenv("PGHOST");
        String pgPort = System.getenv("PGPORT");
        String pgUser = System.getenv("PGUSER");
        String pgPassword = System.getenv("PGPASSWORD");
        String pgDatabase = System.getenv("PGDATABASE");

        if (pgHost != null && !pgHost.isEmpty()) {
            jdbcUrl = "jdbc:postgresql://" + pgHost + ":" +
                      (pgPort != null && !pgPort.isEmpty() ? pgPort : "5432") +
                      "/" + (pgDatabase != null && !pgDatabase.isEmpty() ? pgDatabase : "neondb") +
                      "?sslmode=require";
            username = pgUser != null ? pgUser : "postgres";
            password = pgPassword != null ? pgPassword : "";
            logger.info("Database: using PGHOST={}", pgHost);

            if (testConnection(jdbcUrl, username, password)) {
                logger.info("Database: PGHOST connection successful");
            } else {
                logger.warn("Database: PGHOST connection failed, trying DATABASE_URL fallback...");
                jdbcUrl = null;
            }
        }

        if (jdbcUrl == null) {
            String databaseUrl = System.getenv("DATABASE_URL");
            if (databaseUrl != null && !databaseUrl.isEmpty()) {
                try {
                    URI dbUri = new URI(databaseUrl);
                    String[] userParts = dbUri.getUserInfo() != null
                            ? dbUri.getUserInfo().split(":", 2) : new String[]{"postgres"};
                    username = userParts[0];
                    password = userParts.length > 1 ? userParts[1] : "";

                    jdbcUrl = "jdbc:postgresql://" + dbUri.getHost() + ":" +
                              (dbUri.getPort() > 0 ? dbUri.getPort() : 5432) +
                              dbUri.getPath();

                    if (dbUri.getQuery() != null) {
                        jdbcUrl += "?" + dbUri.getQuery();
                    }

                    logger.info("Database: using DATABASE_URL host={}", dbUri.getHost());

                    if (!testConnection(jdbcUrl, username, password)) {
                        logger.warn("Database: DATABASE_URL connection failed, trying local fallback...");
                        jdbcUrl = null;
                    }
                } catch (Exception e) {
                    logger.warn("Database: Failed to parse DATABASE_URL: {}", e.getMessage());
                    jdbcUrl = null;
                }
            }
        }

        if (jdbcUrl == null) {
            jdbcUrl = "jdbc:postgresql://localhost:5433/piuproject";
            username = "runner";
            password = "runner";
            logger.info("Database: using local fallback on port 5433");
        }

        dataSource.setJdbcUrl(jdbcUrl);
        dataSource.setUsername(username);
        dataSource.setPassword(password);
        dataSource.setDriverClassName("org.postgresql.Driver");
        dataSource.setMaximumPoolSize(5);
        dataSource.setMinimumIdle(1);
        dataSource.setConnectionTimeout(30000);
        dataSource.setIdleTimeout(120000);
        dataSource.setMaxLifetime(300000);
        dataSource.setKeepaliveTime(60000);
        dataSource.setConnectionTestQuery("SELECT 1");
        dataSource.setValidationTimeout(5000);
        dataSource.setInitializationFailTimeout(-1);
        dataSource.setLeakDetectionThreshold(30000);

        return dataSource;
    }

    private boolean testConnection(String jdbcUrl, String username, String password) {
        try (Connection conn = java.sql.DriverManager.getConnection(jdbcUrl, username, password)) {
            conn.createStatement().execute("SELECT 1");
            return true;
        } catch (Exception e) {
            logger.warn("Database: Connection test failed for {}: {}", jdbcUrl, e.getMessage());
            return false;
        }
    }
}
