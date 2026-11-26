package br.com.fiap.leroyassist.config;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;

public final class DatabaseConfig {

    private static final Map<String, String> DOT_ENV = loadDotEnv(Path.of(".env"));

    private DatabaseConfig() {
    }

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(
                requireEnv("DB_URL"),
                requireEnv("DB_USER"),
                requireEnv("DB_PASSWORD"));
    }

    public static String env(String name) {
        String value = System.getenv(name);
        if (value == null || value.isBlank()) {
            value = DOT_ENV.get(name);
        }
        return (value == null || value.isBlank()) ? null : value;
    }

    private static String requireEnv(String name) {
        String value = env(name);
        if (value == null) {
            throw new IllegalStateException("Missing environment variable: " + name);
        }
        return value;
    }

    private static Map<String, String> loadDotEnv(Path file) {
        Map<String, String> values = new HashMap<>();
        if (!Files.isRegularFile(file)) {
            return values;
        }
        try {
            for (String line : Files.readAllLines(file)) {
                String trimmed = line.trim();
                if (trimmed.isEmpty() || trimmed.startsWith("#")) {
                    continue;
                }
                int eq = trimmed.indexOf('=');
                if (eq <= 0) {
                    continue;
                }
                String key = trimmed.substring(0, eq).trim();
                String value = trimmed.substring(eq + 1).trim();
                boolean quoted = value.length() >= 2
                        && ((value.startsWith("\"") && value.endsWith("\""))
                        || (value.startsWith("'") && value.endsWith("'")));
                if (quoted) {
                    value = value.substring(1, value.length() - 1);
                }
                values.put(key, value);
            }
        } catch (IOException e) {
            throw new IllegalStateException("Could not read .env: " + e.getMessage(), e);
        }
        return values;
    }
}
