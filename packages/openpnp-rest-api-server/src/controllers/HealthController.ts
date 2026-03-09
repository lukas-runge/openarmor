import { Controller, Get, Route } from "../tsoa-runtime";

interface HealthResponse {
    status: "OK";
    message: string;
}

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
