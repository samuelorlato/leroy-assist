package br.com.fiap.leroyassist.model;

import com.fasterxml.jackson.databind.JsonNode;

import java.math.BigDecimal;

public record Product(
        long id,
        long categoryId,
        String categoryName,
        String name,
        String brand,
        String description,
        BigDecimal price,
        String unit,
        JsonNode attributes) {
}
