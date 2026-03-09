const InetSocketAddressSrv = Java.type("java.net.InetSocketAddress");
const HttpServerSrv = Java.type("com.sun.net.httpserver.HttpServer");
const URLSrv = Java.type("java.net.URL");
const ThreadSrv = Java.type("java.lang.Thread");

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
    let key = killKey || "__kill__";
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
            const response = body || "";
            const type = contentType || "text/plain; charset=utf-8";
            exchange.getResponseHeaders().set("Content-Type", type);
            const bytes = response.getBytes("UTF-8");
            exchange.sendResponseHeaders(status, bytes.length);
            const os = exchange.getResponseBody();
            os.write(bytes);
            os.close();
        },
        text: function (status: number, body: string): void {
            this.send(status, body, "text/plain; charset=utf-8");
        },
        json: function (status: number, body: string | { [key: string]: any }): void {
            const payload = typeof body === "string" ? body : JSON.stringify(body);
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
    const host = (options && options.host) || "127.0.0.1";
    const port = (options && options.port) || 8080;
    const connectTimeoutMs = (options && options.connectTimeoutMs) || 300;
    const readTimeoutMs = (options && options.readTimeoutMs) || 1000;
    const settleMs = (options && options.settleMs) || 300;
    const killPath = resolveKillPath(options && options.killKey);

    try {
        const conn = new URLSrv("http://" + host + ":" + port + killPath).openConnection();
        conn.setRequestMethod("GET");
        conn.setConnectTimeout(connectTimeoutMs);
        conn.setReadTimeout(readTimeoutMs);

        const code = conn.getResponseCode();
        print("Kill returned " + code);
    } catch (e) {
        print("No old server running.");
    }

    try {
        ThreadSrv.sleep(settleMs);
    } catch (e) {}
}

export function createWebServer(options?: WebServerOptions): OpenPnpWebServer {
    const host = (options && options.host) || "127.0.0.1";
    const port = (options && options.port) || 8080;
    const backlog = (options && options.backlog) || 0;
    const killPath = resolveKillPath(options && options.killKey);
    const routesByPath: { [path: string]: RouteDefinition[] } = {};

    if (options && options.autoKillOld) {
        killOldServer({
            host: host,
            port: port,
            killKey: options.killKey,
        });
    }

    const server = HttpServerSrv.create(new InetSocketAddressSrv(port), backlog);

    function register(method: RouteMethod, path: string, handler: RouteHandler): void {
        const normalizedPath = normalizePath(path);
        if (!routesByPath[normalizedPath]) {
            routesByPath[normalizedPath] = [];
            server.createContext(normalizedPath, function (exchange: com.sun.net.httpserver.HttpExchange) {
                const requestMethod = String(exchange.getRequestMethod()).toUpperCase();
                const routeList = routesByPath[normalizedPath];
                const req: OpenPnpRequest = {
                    exchange: exchange,
                    method: requestMethod,
                    path: String(exchange.getRequestURI().getPath()),
                    query: exchange.getRequestURI().getQuery(),
                };
                const res = createResponse(exchange);
                for (let i = 0; i < routeList.length; i++) {
                    const route = routeList[i];
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
        const res = createResponse(exchange);
        res.text(200, "Bye!");
        print("Server is terminating - bye!");
        server.stop(0);
    });

    const app: OpenPnpWebServer = {
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
