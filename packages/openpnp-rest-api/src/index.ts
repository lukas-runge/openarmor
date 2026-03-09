import { createWebServer, killOldServer, sendNotFound } from "openpnp-utils";

const PORT = 8080;
const killKey = "__kill__";

killOldServer({
    port: PORT,
    killKey: killKey,
});

const app = createWebServer({
    port: PORT,
    killKey: killKey,
});

app.get("/", function (_req, res) {
    res.text(200, "Hello, OpenPnP REST API here!");
});

app.get("/api/health", function (_req, res) {
    res.json(200, {
        status: "OK",
        message: "OpenPnP REST API is healthy and running!",
    });
});

app.get("/part/", function (req, res) {
    const prefix = "/part/";
    const id = req.path.substring(prefix.length);

    if (id.length === 0 || id.indexOf("/") !== -1) {
        res.text(400, "Invalid part id");
        return;
    }

    const part = config.getPart(id);
    if (!part) {
        sendNotFound(res, "Part not found: " + id);
        return;
    }

    res.json(200, {
        id: id,
        name: part.getName(),
    });
});

app.listen();
