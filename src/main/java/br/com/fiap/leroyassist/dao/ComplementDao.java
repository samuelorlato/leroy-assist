package br.com.fiap.leroyassist.dao;

import br.com.fiap.leroyassist.config.DatabaseConfig;
import br.com.fiap.leroyassist.exception.DataAccessException;
import br.com.fiap.leroyassist.model.Complement;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class ComplementDao {

    private static final String SQL = """
            SELECT p.id_product, p.name, p.price, k.reason
              FROM tb_complement k
              JOIN tb_product p ON p.id_product = k.id_complement
             WHERE k.id_product = ?
               AND p.active = 'Y'
             ORDER BY p.id_product
            """;

    public List<Complement> findByProductId(long productId) {
        try (Connection connection = DatabaseConfig.getConnection();
             PreparedStatement statement = connection.prepareStatement(SQL)) {
            statement.setLong(1, productId);
            try (ResultSet rs = statement.executeQuery()) {
                List<Complement> complements = new ArrayList<>();
                while (rs.next()) {
                    complements.add(new Complement(
                            rs.getLong("id_product"),
                            rs.getString("name"),
                            rs.getBigDecimal("price"),
                            rs.getString("reason")));
                }
                return complements;
            }
        } catch (SQLException e) {
            throw new DataAccessException("Could not list complements of product " + productId, e);
        }
    }
}
