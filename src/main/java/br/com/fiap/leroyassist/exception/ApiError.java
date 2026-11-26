package br.com.fiap.leroyassist.exception;

import jakarta.ws.rs.core.Response;

public record ApiError(String error) {

    public static Response response(Response.Status status, String message) {
        return Response.status(status).entity(new ApiError(message)).build();
    }
}
