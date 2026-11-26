package br.com.fiap.leroyassist;

import br.com.fiap.leroyassist.config.DatabaseConfig;
import org.glassfish.grizzly.http.server.HttpServer;
import org.glassfish.jersey.grizzly2.httpserver.GrizzlyHttpServerFactory;
import org.glassfish.jersey.server.ResourceConfig;

import java.net.URI;

public class Main {

    public static void main(String[] args) {
        String port = DatabaseConfig.env("PORT");
        URI baseUri = URI.create("http://0.0.0.0:" + (port != null ? port : "8080") + "/api/");

        ResourceConfig config = new ResourceConfig().packages(
                "br.com.fiap.leroyassist.resource",
                "br.com.fiap.leroyassist.config",
                "br.com.fiap.leroyassist.exception");

        HttpServer server = GrizzlyHttpServerFactory.createHttpServer(baseUri, config);
        Runtime.getRuntime().addShutdownHook(new Thread(server::shutdownNow));

        System.out.println("LeroyAssist demo API running at " + baseUri);
        System.out.println("Try: " + baseUri + "products");
        System.out.println("Press Ctrl+C to stop.");
    }
}
