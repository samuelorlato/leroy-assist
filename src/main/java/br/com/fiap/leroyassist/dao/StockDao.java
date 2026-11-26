package br.com.fiap.leroyassist.dao;

import br.com.fiap.leroyassist.config.DatabaseConfig;
import br.com.fiap.leroyassist.exception.DataAccessException;
import br.com.fiap.leroyassist.model.Stock;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Optional;

public class StockDao {

    private static final String SQL = """
            SELECT id_product, quantity, aisle, shelf, updated_at
              FROM tb_stock
             WHERE id_product = ?
            """;

    public Optional<Stock> findByProductId(long productId) {
        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement statement = connection.prepareStatement(SQL)) {
            statement.setLong(1, productId);
            try (ResultSet rs = statement.executeQuery()) {
                if (!rs.next()) {
                    return Optional.empty();
                }
                return Optional.of(Stock.of(
                        rs.getLong("id_product"),
                        rs.getInt("quantity"),
                        rs.getString("aisle"),
                        rs.getString("shelf"),
                        rs.getTimestamp("updated_at").toInstant().toString()));
            }
        } catch (SQLException e) {
            throw new DataAccessException("Could not read stock of product " + productId, e);
        }
    }
}
