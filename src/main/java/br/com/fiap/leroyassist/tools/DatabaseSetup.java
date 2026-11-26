package br.com.fiap.leroyassist.tools;

import br.com.fiap.leroyassist.config.DatabaseConfig;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

public class DatabaseSetup {

    private static final String DEFAULT_SCRIPT = "sql/create_tables.sql";

    public static void main(String[] args) {
        Path script = Path.of(args.length > 0 ? args[0] : DEFAULT_SCRIPT);

        try (Connection connection = DatabaseConfig.getConnection()) {
            List<String> statements = parse(Files.readAllLines(script));
            System.out.println("Script: " + script.toAbsolutePath());
            System.out.println("Statements found: " + statements.size());

            try (Statement statement = connection.createStatement()) {
                int index = 0;
                for (String sql : statements) {
                    index++;
                    try {
                        statement.execute(sql);
                    } catch (SQLException e) {
                        System.err.printf("Statement %d failed: %s%n%s%n", index, e.getMessage(), sql);
                        System.exit(1);
                    }
                }
            }
            System.out.println("Database setup finished successfully.");
        } catch (IOException e) {
            System.err.println("Could not read script: " + e.getMessage());
            System.exit(1);
        } catch (SQLException | IllegalStateException e) {
            System.err.println("Database error: " + e.getMessage());
            System.exit(1);
        }
    }

    static List<String> parse(List<String> lines) {
        List<String> statements = new ArrayList<>();
        StringBuilder buffer = new StringBuilder();

        for (String line : lines) {
            String trimmed = line.trim();

            if (trimmed.isEmpty() || trimmed.startsWith("--")) {
                continue;
            }

            if (trimmed.equals("/")) {
                addIfNotEmpty(statements, buffer.toString());
                buffer.setLength(0);
                continue;
            }

            buffer.append(line).append('\n');

            boolean plsqlBlock = startsPlsql(buffer);
            if (!plsqlBlock && trimmed.endsWith(";")) {
                String sql = buffer.toString().trim();
                addIfNotEmpty(statements, sql.substring(0, sql.length() - 1));
                buffer.setLength(0);
            }
        }

        addIfNotEmpty(statements, buffer.toString());
        return statements;
    }

    private static boolean startsPlsql(StringBuilder buffer) {
        String start = buffer.toString().stripLeading().toUpperCase();
        return start.startsWith("BEGIN") || start.startsWith("DECLARE");
    }

    private static void addIfNotEmpty(List<String> statements, String sql) {
        if (!sql.isBlank()) {
            statements.add(sql.trim());
        }
    }
}
