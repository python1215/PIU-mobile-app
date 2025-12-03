package com.piun.piuproject.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;
import java.net.URISyntaxException;

@Configuration
public class DatabaseConfig {

    @Value("${DATABASE_URL:}")
    private String databaseUrl;

    @Bean
    @Primary
    public DataSource dataSource() throws URISyntaxException {
        HikariDataSource dataSource = new HikariDataSource();
        
        if (databaseUrl != null && !databaseUrl.isEmpty()) {
            // Parse the DATABASE_URL and convert to JDBC format
            URI dbUri = new URI(databaseUrl);
            
            String username = dbUri.getUserInfo().split(":")[0];
            String password = dbUri.getUserInfo().split(":")[1];
            
            // Build JDBC URL
            String jdbcUrl = "jdbc:postgresql://" + dbUri.getHost() + ":" + 
                            (dbUri.getPort() > 0 ? dbUri.getPort() : 5432) + 
                            dbUri.getPath();
            
            // Add query parameters if they exist
            if (dbUri.getQuery() != null) {
                jdbcUrl += "?" + dbUri.getQuery();
            }
            
            dataSource.setJdbcUrl(jdbcUrl);
            dataSource.setUsername(username);
            dataSource.setPassword(password);
        } else {
            // Fallback for local development
            dataSource.setJdbcUrl("jdbc:postgresql://localhost:5432/piun");
            dataSource.setUsername("postgres");
            dataSource.setPassword("postgres");
        }
        
        dataSource.setDriverClassName("org.postgresql.Driver");
        dataSource.setMaximumPoolSize(10);
        dataSource.setMinimumIdle(2);
        dataSource.setConnectionTimeout(30000);
        dataSource.setIdleTimeout(600000);
        dataSource.setMaxLifetime(1800000);
        
        return dataSource;
    }
}
