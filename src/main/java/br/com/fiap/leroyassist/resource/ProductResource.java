package br.com.fiap.leroyassist.resource;

import br.com.fiap.leroyassist.exception.ApiError;
import br.com.fiap.leroyassist.model.Product;
import br.com.fiap.leroyassist.service.CatalogService;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;

@Path("products")
@Produces(MediaType.APPLICATION_JSON)
public class ProductResource {

    private final CatalogService service = new CatalogService();

    @GET
    public List<Product> list(@QueryParam("category") Long categoryId) {
        return service.listProducts(categoryId);
    }

    @GET
    @Path("{id}")
    public Response get(@PathParam("id") long id) {
        return service.findDetail(id)
                .map(detail -> Response.ok(detail).build())
                .orElseGet(() -> ApiError.response(Response.Status.NOT_FOUND, "Product not found: " + id));
    }
}
