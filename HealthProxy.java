import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpExchange;
import java.io.*;
import java.net.*;
import java.nio.file.*;

public class HealthProxy {
    static volatile boolean backendReady = false;
    static final int PROXY_PORT = 5000;
    static final int BACKEND_PORT = 8080;

    public static void main(String[] args) throws Exception {
        String jarPath = "backend/target/piuproject-1.0.0.jar";
        String distDir = "dist";

        HttpServer server = HttpServer.create(new InetSocketAddress("0.0.0.0", PROXY_PORT), 0);

        server.createContext("/health", ex -> {
            String json = "{\"status\":\"UP\",\"backend_ready\":" + backendReady + "}";
            sendResponse(ex, 200, "application/json", json.getBytes());
        });

        server.createContext("/api/", ex -> {
            if (!backendReady) {
                String json = "{\"error\":\"Backend starting\",\"message\":\"Please wait...\"}";
                sendResponse(ex, 503, "application/json", json.getBytes());
                return;
            }
            proxyRequest(ex);
        });

        server.createContext("/", ex -> {
            String path = ex.getRequestURI().getPath();
            if (path.startsWith("/api/")) {
                if (!backendReady) {
                    sendResponse(ex, 503, "application/json", "{\"error\":\"Starting\"}".getBytes());
                } else {
                    proxyRequest(ex);
                }
                return;
            }

            File file = new File(distDir, path.equals("/") ? "index.html" : path);
            if (!file.exists() || file.isDirectory()) {
                file = new File(distDir, "index.html");
            }
            if (file.exists()) {
                byte[] data = Files.readAllBytes(file.toPath());
                String ct = guessContentType(file.getName());
                sendResponse(ex, 200, ct, data);
            } else {
                String json = "{\"status\":\"UP\",\"service\":\"PIU Project Management API\"}";
                sendResponse(ex, 200, "application/json", json.getBytes());
            }
        });

        server.setExecutor(java.util.concurrent.Executors.newFixedThreadPool(10));
        server.start();
        System.out.println("[PROXY] Listening on port " + PROXY_PORT);

        ProcessBuilder pb = new ProcessBuilder(
            "java", "-Xms128m", "-Xmx512m", "-XX:+UseSerialGC", "-XX:MaxMetaspaceSize=128m",
            "-Dserver.port=" + BACKEND_PORT,
            "-Dspring.jpa.hibernate.ddl-auto=update",
            "-jar", jarPath
        );
        pb.inheritIO();
        Process proc = pb.start();

        new Thread(() -> {
            for (int i = 0; i < 120; i++) {
                try {
                    HttpURLConnection conn = (HttpURLConnection) new URL("http://127.0.0.1:" + BACKEND_PORT + "/health").openConnection();
                    conn.setConnectTimeout(2000);
                    conn.setReadTimeout(2000);
                    if (conn.getResponseCode() < 500) {
                        backendReady = true;
                        System.out.println("[PROXY] Spring Boot ready after ~" + i + "s");
                        return;
                    }
                } catch (Exception ignored) {}
                try { Thread.sleep(1000); } catch (InterruptedException e) { return; }
            }
            System.out.println("[PROXY] Spring Boot failed to start in 120s");
        }).start();

        Runtime.getRuntime().addShutdownHook(new Thread(() -> { proc.destroyForcibly(); server.stop(0); }));
        proc.waitFor();
    }

    static void sendResponse(HttpExchange ex, int code, String contentType, byte[] body) throws IOException {
        ex.getResponseHeaders().set("Content-Type", contentType);
        ex.sendResponseHeaders(code, body.length);
        ex.getResponseBody().write(body);
        ex.getResponseBody().close();
    }

    static void proxyRequest(HttpExchange ex) throws IOException {
        try {
            String urlStr = "http://127.0.0.1:" + BACKEND_PORT + ex.getRequestURI().toString();
            HttpURLConnection conn = (HttpURLConnection) new URL(urlStr).openConnection();
            conn.setRequestMethod(ex.getRequestMethod());
            conn.setConnectTimeout(60000);
            conn.setReadTimeout(60000);

            for (var entry : ex.getRequestHeaders().entrySet()) {
                if (!entry.getKey().equalsIgnoreCase("Host")) {
                    for (String v : entry.getValue()) conn.addRequestProperty(entry.getKey(), v);
                }
            }

            if ("POST".equals(ex.getRequestMethod()) || "PUT".equals(ex.getRequestMethod()) || "PATCH".equals(ex.getRequestMethod())) {
                conn.setDoOutput(true);
                ex.getRequestBody().transferTo(conn.getOutputStream());
            }

            int status = conn.getResponseCode();
            InputStream in = status >= 400 ? conn.getErrorStream() : conn.getInputStream();
            byte[] body = in != null ? in.readAllBytes() : new byte[0];

            for (var entry : conn.getHeaderFields().entrySet()) {
                if (entry.getKey() != null && !entry.getKey().equalsIgnoreCase("Transfer-Encoding")) {
                    for (String v : entry.getValue()) ex.getResponseHeaders().add(entry.getKey(), v);
                }
            }
            ex.sendResponseHeaders(status, body.length);
            ex.getResponseBody().write(body);
            ex.getResponseBody().close();
        } catch (Exception e) {
            String json = "{\"error\":\"Backend unavailable\",\"message\":\"" + e.getMessage() + "\"}";
            sendResponse(ex, 503, "application/json", json.getBytes());
        }
    }

    static String guessContentType(String name) {
        if (name.endsWith(".html")) return "text/html";
        if (name.endsWith(".js")) return "application/javascript";
        if (name.endsWith(".css")) return "text/css";
        if (name.endsWith(".json")) return "application/json";
        if (name.endsWith(".png")) return "image/png";
        if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";
        if (name.endsWith(".svg")) return "image/svg+xml";
        if (name.endsWith(".ico")) return "image/x-icon";
        if (name.endsWith(".woff")) return "font/woff";
        if (name.endsWith(".woff2")) return "font/woff2";
        if (name.endsWith(".map")) return "application/json";
        return "application/octet-stream";
    }
}
