package br.com.fiap.leroyassist.model;

import java.util.List;

public record ProductDetail(Product product, Stock stock, List<Complement> complements) {
}
