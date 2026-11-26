package br.com.fiap.leroyassist.dao;

import br.com.fiap.leroyassist.config.DatabaseConfig;
import br.com.fiap.leroyassist.exception.DataAccessException;
import br.com.fiap.leroyassist.model.Product;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class ProductDao {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private static final String BASE_SQL = """
            SELECT p.id_product, p.id_category, c.name AS category_name, p.name, p.brand,
                   p.description, p.price, p.unit, p.attributes
              FROM tb_product p
              JOIN tb_category c ON c.id_category = p.id_category
             WHERE p.active = 'Y'
            """;

    public List<Product> findAll(Long categoryId) {
        String sql = BASE_SQL
                + (categoryId != null ? " AND p.id_category = ?\n" : "")
                + " ORDER BY p.id_product";

        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            if (categoryId != null) {
                statement.setLong(1, categoryId);
            }
            try (ResultSet rs = statement.executeQuery()) {
                List<Product> products = new ArrayList<>();
                while (rs.next()) {
                    products.add(map(rs));
                }
                return products;
            }
        } catch (SQLException e) {
            throw new DataAccessException("Could not list products", e);
        }
    }

    public Optional<Product> findById(long id) {
        String sql = BASE_SQL + " AND p.id_product = ?";

        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setLong(1, id);
            try (ResultSet rs = statement.executeQuery()) {
                return rs.next() ? Optional.of(map(rs)) : Optional.empty();
            }
        } catch (SQLException e) {
            throw new DataAccessException("Could not find product " + id, e);
        }
    }

    private Product map(ResultSet rs) throws SQLException {
        return new Product(
                rs.getLong("id_product"),
                rs.getLong("id_category"),
                rs.getString("category_name"),
                rs.getString("name"),
                rs.getString("brand"),
                rs.getString("description"),
                rs.getBigDecimal("price"),
                rs.getString("unit"),
                parseAttributes(rs.getString("attributes")));
    }

    private JsonNode parseAttributes(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        try {
            return MAPPER.readTree(raw);
        } catch (JsonProcessingException e) {
            throw new DataAccessException("Invalid JSON in product attributes", e);
        }
    }
}
