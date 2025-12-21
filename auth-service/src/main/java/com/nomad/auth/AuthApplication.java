
package com.nomad.auth;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing // Enables automatic timestamps (CreatedDate/LastModifiedDate)
public class AuthApplication {

    public static void main(String[] args) {
        loadEnv();
        SpringApplication.run(AuthApplication.class, args);
    }

    private static void loadEnv() {
        try {
            Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
            dotenv.entries().forEach(entry ->
                    System.setProperty(entry.getKey(), entry.getValue())
            );
        } catch (Exception e) {
            System.out.println(".env file not found, relying on System Environment Variables");
        }
    }
}