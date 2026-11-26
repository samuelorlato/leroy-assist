package br.com.fiap.leroyassist.resource;

import br.com.fiap.leroyassist.exception.ApiError;
import br.com.fiap.leroyassist.service.CatalogService;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("stock")
@Produces(MediaType.APPLICATION_JSON)
public class StockResource {

    private final CatalogService service = new CatalogService();

    @GET
    @Path("{productId}")
    public Response get(@PathParam("productId") long productId) {
        return service.findStock(productId)
                .map(stock -> Response.ok(stock).build())
                .orElseGet(() -> ApiError.response(Response.Status.NOT_FOUND,
                        "Stock not found for product: " + productId));
    }
}
