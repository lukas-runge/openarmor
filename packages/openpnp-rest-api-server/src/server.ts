import { createWebServer, killOldServer } from "openpnp-utils";
import { RegisterRoutes } from "../generated/routes";

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
    res.text(200, "OpenPnP REST API server is running.");
});

RegisterRoutes(app);

app.listen();
