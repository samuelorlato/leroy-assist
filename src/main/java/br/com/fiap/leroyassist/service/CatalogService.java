package br.com.fiap.leroyassist.service;

import br.com.fiap.leroyassist.dao.ComplementDao;
import br.com.fiap.leroyassist.dao.ProductDao;
import br.com.fiap.leroyassist.dao.StockDao;
import br.com.fiap.leroyassist.model.Product;
import br.com.fiap.leroyassist.model.ProductDetail;
import br.com.fiap.leroyassist.model.Stock;

import java.util.List;
import java.util.Optional;

public class CatalogService {

    private final ProductDao productDao = new ProductDao();
    private final StockDao stockDao = new StockDao();
    private final ComplementDao complementDao = new ComplementDao();

    public List<Product> listProducts(Long categoryId) {
        return productDao.findAll(categoryId);
    }

    public Optional<ProductDetail> findDetail(long productId) {
        return productDao.findById(productId).map(this::toDetail);
    }

    public List<ProductDetail> listDetails(Long categoryId) {
        return productDao.findAll(categoryId).stream().map(this::toDetail).toList();
    }

    public Optional<Stock> findStock(long productId) {
        return stockDao.findByProductId(productId);
    }

    private ProductDetail toDetail(Product product) {
        Stock stock = stockDao.findByProductId(product.id()).orElse(null);
        return new ProductDetail(product, stock, complementDao.findByProductId(product.id()));
    }
}
