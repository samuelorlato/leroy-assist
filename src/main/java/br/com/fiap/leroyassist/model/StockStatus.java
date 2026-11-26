package br.com.fiap.leroyassist.model;

public enum StockStatus {
    IN_STOCK,
    LOW_STOCK,
    OUT_OF_STOCK;

    private static final int LOW_STOCK_THRESHOLD = 5;

    public static StockStatus from(int quantity) {
        if (quantity <= 0) {
            return OUT_OF_STOCK;
        }
        return quantity <= LOW_STOCK_THRESHOLD ? LOW_STOCK : IN_STOCK;
    }
}
