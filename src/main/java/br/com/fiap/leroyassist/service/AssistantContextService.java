package br.com.fiap.leroyassist.service;

import br.com.fiap.leroyassist.model.AssistantContext;

import java.time.Instant;
import java.util.List;

public class AssistantContextService {

    private static final List<String> CONSTRAINTS = List.of(
            "Recommend only products listed in candidates.",
            "Never recommend a product with stock.status OUT_OF_STOCK as the main option; offer an in-stock alternative.",
            "Justify every recommendation using only attribute values present in the product data.",
            "Return one main product and up to two alternatives, plus optional complements from the project kit.",
            "If the need is outside the scope of the candidates, suggest calling a salesperson.");

    private final CatalogService catalogService = new CatalogService();

    public AssistantContext build(String need) {
        return new AssistantContext(
                need.trim(),
                Instant.now().toString(),
                CONSTRAINTS,
                catalogService.listDetails(null));
    }
}
