import { Controller, Get, Route } from "../tsoa-runtime";
import type { HealthResponse } from "./contracts";

@Route("api/health")
export class HealthController extends Controller {
    @Get()
    public check(): HealthResponse {
        return {
            status: "OK",
            message: "OpenPnP REST API is healthy and running.",
        };
    }
}
