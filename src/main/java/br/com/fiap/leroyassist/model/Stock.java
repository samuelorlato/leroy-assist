package br.com.fiap.leroyassist.model;

public record Stock(
        long productId,
        int quantity,
        String aisle,
        String shelf,
        String updatedAt,
        StockStatus status) {

    public static Stock of(long productId, int quantity, String aisle, String shelf, String updatedAt) {
        return new Stock(productId, quantity, aisle, shelf, updatedAt, StockStatus.from(quantity));
    }
}
