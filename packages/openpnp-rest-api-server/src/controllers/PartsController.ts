import { Body, Controller, Delete, Get, Path, Post, Put, Route, SuccessResponse } from "../tsoa-runtime";
import type { CreatePartRequest, DeletePartResponse, PartDto, SetPartByIdRequest } from "./contracts";
import { createHttpError, listFromCollection, validateNumberField, validateStringField } from "./common";

const LengthClass = Java.type("org.openpnp.model.Length");
const PartClass = Java.type("org.openpnp.model.Part");

function toLengthValue(length: org.openpnp.model.Length | null): number | null {
    if (!length) {
        return null;
    }
    return Number(length.getValue());
}

function toPartDto(part: org.openpnp.model.Part): PartDto {
    const packageRef = part.getPackage();
    const bottomVisionRef = part.getBottomVisionSettings();
    const fiducialVisionRef = part.getFiducialVisionSettings();
    const name = part.getName();
    return {
        id: String(part.getId()),
        name: name ? String(name) : null,
        height: toLengthValue(part.getHeight()),
        throughBoardDepth: toLengthValue(part.getThroughBoardDepth()),
        package: packageRef ? String(packageRef.getId()) : null,
        speed: Number(part.getSpeed()),
        bottomVision: bottomVisionRef ? String(bottomVisionRef.getId()) : null,
        fiducialVision: fiducialVisionRef ? String(fiducialVisionRef.getId()) : null,
    };
}

function toLengthOrNull(value: number | null): org.openpnp.model.Length | null {
    if (value === null) {
        return null;
    }
    return new LengthClass(value, config.getSystemUnits());
}

function validatePartPayload(part: PartDto): PartDto {
    if (typeof part.id !== "string" || part.id.length === 0) {
        throw createHttpError(400, "Field 'part.id' is required and must be a non-empty string.");
    }

    if (typeof part.name !== "string") {
        throw createHttpError(400, "Field 'part.name' is required and must be a string.");
    }

    return {
        id: part.id,
        name: part.name,
        height: validateNumberField(part.height, "part.height"),
        throughBoardDepth: validateNumberField(part.throughBoardDepth, "part.throughBoardDepth"),
        package: validateStringField(part.package, "part.package"),
        speed: validateNumberField(part.speed, "part.speed"),
        bottomVision: validateStringField(part.bottomVision, "part.bottomVision"),
        fiducialVision: validateStringField(part.fiducialVision, "part.fiducialVision"),
    };
}

function applyPartPayload(part: org.openpnp.model.Part, payload: PartDto): void {
    part.setId(payload.id);
    part.setName(payload.name as any);

    part.setHeight(toLengthOrNull(payload.height) as any);
    part.setThroughBoardDepth(toLengthOrNull(payload.throughBoardDepth) as any);

    if (payload.package === null) {
        part.setPackage(null as any);
    } else {
        const packageRef = config.getPackage(payload.package);
        if (!packageRef) {
            throw createHttpError(400, "Package not found: " + payload.package);
        }
        part.setPackage(packageRef);
    }

    if (payload.speed !== null) {
        part.setSpeed(payload.speed);
    }

    if (payload.bottomVision === null) {
        part.setBottomVisionSettings(null as any);
    } else {
        const bottomVisionSettings = config.getVisionSettings(payload.bottomVision);
        if (!bottomVisionSettings) {
            throw createHttpError(400, "Bottom vision settings not found: " + payload.bottomVision);
        }
        part.setBottomVisionSettings(bottomVisionSettings as org.openpnp.model.BottomVisionSettings);
    }

    if (payload.fiducialVision === null) {
        part.setFiducialVisionSettings(null as any);
    } else {
        const fiducialVisionSettings = config.getVisionSettings(payload.fiducialVision);
        if (!fiducialVisionSettings) {
            throw createHttpError(400, "Fiducial vision settings not found: " + payload.fiducialVision);
        }
        part.setFiducialVisionSettings(fiducialVisionSettings as org.openpnp.model.FiducialVisionSettings);
    }
}

@Route("api/parts")
export class PartsController extends Controller {
    @Get()
    public listParts(): PartDto[] {
        const parts = listFromCollection<org.openpnp.model.Part>(config.getParts());
        const result: PartDto[] = [];
        for (let i = 0; i < parts.length; i++) {
            result.push(toPartDto(parts[i]));
        }
        return result;
    }

    @Get("{id}")
    public getPartById(@Path() id: string): PartDto {
        const part = config.getPart(id);
        if (!part) {
            throw createHttpError(404, "Part not found: " + id);
        }
        return toPartDto(part);
    }

    @SuccessResponse("201", "Created")
    @Post()
    public createPart(@Body() body: CreatePartRequest): PartDto {
        const payload = validatePartPayload(body.part);
        if (config.getPart(payload.id)) {
            throw createHttpError(409, "Part already exists: " + payload.id);
        }

        const part = new PartClass(payload.id);
        applyPartPayload(part, payload);
        config.addPart(part);
        config.save();
        this.setStatus(201);
        return toPartDto(part);
    }

    @Put("{id}")
    public setPartById(@Path() id: string, @Body() body: SetPartByIdRequest): PartDto {
        const payload = validatePartPayload(body.part);
        if (payload.id !== id) {
            throw createHttpError(400, "Path id does not match body.part.id.");
        }

        const existing = config.getPart(id);
        const part = existing || new PartClass(id);
        applyPartPayload(part, payload);
        if (!existing) {
            config.addPart(part);
        }
        config.save();
        return toPartDto(part);
    }

    @Delete("{id}")
    public deletePartById(@Path() id: string): DeletePartResponse {
        const part = config.getPart(id);
        if (!part) {
            throw createHttpError(404, "Part not found: " + id);
        }
        config.removePart(part);
        config.save();
        return { deleted: true };
    }
}
