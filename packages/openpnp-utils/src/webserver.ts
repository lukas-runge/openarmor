var InetSocketAddressSrv = Java.type("java.net.InetSocketAddress");
var HttpServerSrv = Java.type("com.sun.net.httpserver.HttpServer");
var URLSrv = Java.type("java.net.URL");
var ThreadSrv = Java.type("java.lang.Thread");

type RouteMethod = "GET" | "POST" | "PUT" | "DELETE" | "HEAD" | "ALL";

export interface WebServerOptions {
    port?: number;
    host?: string;
    backlog?: number;
    killKey?: string;
    autoKillOld?: boolean;
}

export interface KillServerOptions {
    host?: string;
    port?: number;
    killKey?: string;
    connectTimeoutMs?: number;
    readTimeoutMs?: number;
    settleMs?: number;
}

export interface OpenPnpRequest {
    exchange: com.sun.net.httpserver.HttpExchange;
    method: string;
    path: string;
    query: string | null;
}

export interface OpenPnpResponse {
    setHeader(name: string, value: string): void;
    send(status: number, body: string, contentType?: string): void;
    text(status: number, body: string): void;
    json(status: number, body: string | { [key: string]: any }): void;
}

export type RouteHandler = (req: OpenPnpRequest, res: OpenPnpResponse) => void;

interface RouteDefinition {
    method: RouteMethod;
    path: string;
    handler: RouteHandler;
}

export interface OpenPnpWebServer {
    readonly port: number;
    readonly killPath: string;
    get(path: string, handler: RouteHandler): OpenPnpWebServer;
    post(path: string, handler: RouteHandler): OpenPnpWebServer;
    put(path: string, handler: RouteHandler): OpenPnpWebServer;
    delete(path: string, handler: RouteHandler): OpenPnpWebServer;
    head(path: string, handler: RouteHandler): OpenPnpWebServer;
    all(path: string, handler: RouteHandler): OpenPnpWebServer;
    listen(): void;
    stop(delaySeconds?: number): void;
}

function normalizePath(path: string): string {
    if (!path || path.charAt(0) !== "/") {
        throw "Route path must start with '/'.";
    }

    return path;
}

function resolveKillPath(killKey?: string): string {
    var key = killKey || "__kill__";
    if (key.charAt(0) === "/") {
        key = key.substring(1);
    }

    return "/" + key;
}

function createResponse(exchange: com.sun.net.httpserver.HttpExchange): OpenPnpResponse {
    return {
        setHeader: function (name: string, value: string): void {
            exchange.getResponseHeaders().set(name, value);
        },
        send: function (status: number, body: string, contentType?: string): void {
            var response = body || "";
            var type = contentType || "text/plain; charset=utf-8";
            exchange.getResponseHeaders().set("Content-Type", type);
            var bytes = response.getBytes("UTF-8");
            exchange.sendResponseHeaders(status, bytes.length);
            var os = exchange.getResponseBody();
            os.write(bytes);
            os.close();
        },
        text: function (status: number, body: string): void {
            this.send(status, body, "text/plain; charset=utf-8");
        },
        json: function (status: number, body: string | { [key: string]: any }): void {
            var payload = typeof body === "string" ? body : JSON.stringify(body);
            this.send(status, payload, "application/json; charset=utf-8");
        },
    };
}

function sendMethodNotAllowed(res: OpenPnpResponse, method: string): void {
    res.text(405, "Method not allowed: " + method);
}

export function sendNotFound(res: OpenPnpResponse, body?: string): void {
    res.text(404, body || "Not found");
}

export function killOldServer(options?: KillServerOptions): void {
    var host = (options && options.host) || "127.0.0.1";
    var port = (options && options.port) || 8080;
    var connectTimeoutMs = (options && options.connectTimeoutMs) || 300;
    var readTimeoutMs = (options && options.readTimeoutMs) || 1000;
    var settleMs = (options && options.settleMs) || 300;
    var killPath = resolveKillPath(options && options.killKey);

    try {
        var conn = new URLSrv("http://" + host + ":" + port + killPath).openConnection();
        conn.setRequestMethod("GET");
        conn.setConnectTimeout(connectTimeoutMs);
        conn.setReadTimeout(readTimeoutMs);

        var code = conn.getResponseCode();
        print("Kill returned " + code);
    } catch (e) {
        print("No old server running.");
    }

    try {
        ThreadSrv.sleep(settleMs);
    } catch (e) {}
}

export function createWebServer(options?: WebServerOptions): OpenPnpWebServer {
    var host = (options && options.host) || "127.0.0.1";
    var port = (options && options.port) || 8080;
    var backlog = (options && options.backlog) || 0;
    var killPath = resolveKillPath(options && options.killKey);
    var routesByPath: { [path: string]: RouteDefinition[] } = {};

    if (options && options.autoKillOld) {
        killOldServer({
            host: host,
            port: port,
            killKey: options.killKey,
        });
    }

    var server = HttpServerSrv.create(new InetSocketAddressSrv(port), backlog);

    function register(method: RouteMethod, path: string, handler: RouteHandler): void {
        var normalizedPath = normalizePath(path);
        if (!routesByPath[normalizedPath]) {
            routesByPath[normalizedPath] = [];
            server.createContext(normalizedPath, function (exchange: com.sun.net.httpserver.HttpExchange) {
                var requestMethod = String(exchange.getRequestMethod()).toUpperCase();
                var routeList = routesByPath[normalizedPath];
                var req: OpenPnpRequest = {
                    exchange: exchange,
                    method: requestMethod,
                    path: String(exchange.getRequestURI().getPath()),
                    query: exchange.getRequestURI().getQuery(),
                };
                var res = createResponse(exchange);
                var i;
                for (i = 0; i < routeList.length; i++) {
                    var route = routeList[i];
                    if (route.method === "ALL" || route.method === requestMethod) {
                        route.handler(req, res);
                        return;
                    }
                }

                sendMethodNotAllowed(res, requestMethod);
            });
        }

        routesByPath[normalizedPath].push({
            method: method,
            path: normalizedPath,
            handler: handler,
        });
    }

    server.createContext(killPath, function (exchange: com.sun.net.httpserver.HttpExchange) {
        var res = createResponse(exchange);
        res.text(200, "Bye!");
        print("Server is terminating - bye!");
        server.stop(0);
    });

    var app: OpenPnpWebServer = {
        port: port,
        killPath: killPath,
        get: function (path: string, handler: RouteHandler): OpenPnpWebServer {
            register("GET", path, handler);
            return app;
        },
        post: function (path: string, handler: RouteHandler): OpenPnpWebServer {
            register("POST", path, handler);
            return app;
        },
        put: function (path: string, handler: RouteHandler): OpenPnpWebServer {
            register("PUT", path, handler);
            return app;
        },
        delete: function (path: string, handler: RouteHandler): OpenPnpWebServer {
            register("DELETE", path, handler);
            return app;
        },
        head: function (path: string, handler: RouteHandler): OpenPnpWebServer {
            register("HEAD", path, handler);
            return app;
        },
        all: function (path: string, handler: RouteHandler): OpenPnpWebServer {
            register("ALL", path, handler);
            return app;
        },
        listen: function (): void {
            server.setExecutor(null);
            server.start();
            print("The server is listening on http://" + host + ":" + port);
        },
        stop: function (delaySeconds?: number): void {
            server.stop(delaySeconds || 0);
        },
    };

    return app;
}
