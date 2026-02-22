package com.piun.piuproject.config;

import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;

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
        String databaseUrl = System.getenv("DATABASE_URL");

        if (pgHost != null && !pgHost.isEmpty()) {
            String port = (pgPort != null && !pgPort.isEmpty()) ? pgPort : "5432";
            String db = (pgDatabase != null && !pgDatabase.isEmpty()) ? pgDatabase : "neondb";
            String sslMode = pgHost.contains(".neon.tech") ? "require" : "prefer";
            jdbcUrl = "jdbc:postgresql://" + pgHost + ":" + port + "/" + db +
                      "?sslmode=" + sslMode + "&connectTimeout=5&socketTimeout=10&loginTimeout=5";
            username = pgUser != null ? pgUser : "postgres";
            password = pgPassword != null ? pgPassword : "";
            logger.info("Database: configured with PGHOST={} sslmode={}", pgHost, sslMode);
        } else if (databaseUrl != null && !databaseUrl.isEmpty()) {
            try {
                URI dbUri = new URI(databaseUrl);
                String[] userParts = dbUri.getUserInfo() != null
                        ? dbUri.getUserInfo().split(":", 2) : new String[]{"postgres"};
                username = userParts[0];
                password = userParts.length > 1 ? userParts[1] : "";

                jdbcUrl = "jdbc:postgresql://" + dbUri.getHost() + ":" +
                          (dbUri.getPort() > 0 ? dbUri.getPort() : 5432) +
                          dbUri.getPath() +
                          "?connectTimeout=5&socketTimeout=10&loginTimeout=5";

                if (dbUri.getQuery() != null) {
                    jdbcUrl += "&" + dbUri.getQuery();
                }

                logger.info("Database: configured with DATABASE_URL host={}", dbUri.getHost());
            } catch (Exception e) {
                logger.warn("Database: Failed to parse DATABASE_URL: {}", e.getMessage());
            }
        }

        if (jdbcUrl == null) {
            jdbcUrl = "jdbc:postgresql://localhost:5433/piuproject?connectTimeout=5&socketTimeout=10&loginTimeout=5";
            username = "runner";
            password = "runner";
            logger.info("Database: configured with local fallback on port 5433");
        }

        dataSource.setJdbcUrl(jdbcUrl);
        dataSource.setUsername(username);
        dataSource.setPassword(password);
        dataSource.setDriverClassName("org.postgresql.Driver");
        dataSource.setMaximumPoolSize(5);
        dataSource.setMinimumIdle(0);
        dataSource.setConnectionTimeout(5000);
        dataSource.setIdleTimeout(120000);
        dataSource.setMaxLifetime(300000);
        dataSource.setKeepaliveTime(60000);
        dataSource.setConnectionTestQuery("SELECT 1");
        dataSource.setValidationTimeout(3000);
        dataSource.setInitializationFailTimeout(-1);
        dataSource.setLeakDetectionThreshold(30000);

        return dataSource;
    }
}
