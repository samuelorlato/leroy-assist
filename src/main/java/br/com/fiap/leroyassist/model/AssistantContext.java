package br.com.fiap.leroyassist.model;

import java.util.List;

public record AssistantContext(
        String need,
        String generatedAt,
        List<String> constraints,
        List<ProductDetail> candidates) {
}
