package br.com.fiap.leroyassist.resource;

import br.com.fiap.leroyassist.exception.ApiError;
import br.com.fiap.leroyassist.service.AssistantContextService;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("assistant")
@Produces(MediaType.APPLICATION_JSON)
public class AssistantResource {

    private final AssistantContextService service = new AssistantContextService();

    @GET
    @Path("context")
    public Response context(@QueryParam("need") String need) {
        if (need == null || need.isBlank()) {
            return ApiError.response(Response.Status.BAD_REQUEST, "Query parameter 'need' is required");
        }
        return Response.ok(service.build(need)).build();
    }
}
