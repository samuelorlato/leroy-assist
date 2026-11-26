package br.com.fiap.leroyassist.model;

import java.math.BigDecimal;

public record Complement(long id, String name, BigDecimal price, String reason) {
}
