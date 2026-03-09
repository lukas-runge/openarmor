import { Body, Controller, Delete, Get, Path, Post, Put, Route, SuccessResponse } from "../tsoa-runtime";
import type { CreatePackageRequest, DeletePackageResponse, PackageDto, SetPackageByIdRequest } from "./contracts";
import { createHttpError, listFromCollection, validateNumberField, validateStringField } from "./common";

const PackageClass = Java.type("org.openpnp.model.Package");

function toPackageDto(pkg: org.openpnp.model.Package): PackageDto {
    const bottomVisionRef = pkg.getBottomVisionSettings();
    const fiducialVisionRef = pkg.getFiducialVisionSettings();
    const description = pkg.getDescription();
    const tapeSpecification = pkg.getTapeSpecification();

    return {
        id: String(pkg.getId()),
        description: description ? String(description) : null,
        tapeSpecification: tapeSpecification ? String(tapeSpecification) : null,
        pickVacuumLevel: Number(pkg.getPickVacuumLevel()),
        placeBlowOffLevel: Number(pkg.getPlaceBlowOffLevel()),
        bottomVision: bottomVisionRef ? String(bottomVisionRef.getId()) : null,
        fiducialVision: fiducialVisionRef ? String(fiducialVisionRef.getId()) : null,
    };
}

function validatePackagePayload(pkg: PackageDto): PackageDto {
    if (typeof pkg.id !== "string" || pkg.id.length === 0) {
        throw createHttpError(400, "Field 'pkg.id' is required and must be a non-empty string.");
    }

    return {
        id: pkg.id,
        description: validateStringField(pkg.description, "pkg.description"),
        tapeSpecification: validateStringField(pkg.tapeSpecification, "pkg.tapeSpecification"),
        pickVacuumLevel: validateNumberField(pkg.pickVacuumLevel, "pkg.pickVacuumLevel"),
        placeBlowOffLevel: validateNumberField(pkg.placeBlowOffLevel, "pkg.placeBlowOffLevel"),
        bottomVision: validateStringField(pkg.bottomVision, "pkg.bottomVision"),
        fiducialVision: validateStringField(pkg.fiducialVision, "pkg.fiducialVision"),
    };
}

function applyPackagePayload(pkg: org.openpnp.model.Package, payload: PackageDto): void {
    pkg.setId(payload.id);
    pkg.setDescription(payload.description as any);
    pkg.setTapeSpecification(payload.tapeSpecification as any);

    if (payload.pickVacuumLevel !== null) {
        pkg.setPickVacuumLevel(payload.pickVacuumLevel);
    }

    if (payload.placeBlowOffLevel !== null) {
        pkg.setPlaceBlowOffLevel(payload.placeBlowOffLevel);
    }

    if (payload.bottomVision === null) {
        pkg.setBottomVisionSettings(null as any);
    } else {
        const bottomVisionSettings = config.getVisionSettings(payload.bottomVision);
        if (!bottomVisionSettings) {
            throw createHttpError(400, "Bottom vision settings not found: " + payload.bottomVision);
        }
        pkg.setBottomVisionSettings(bottomVisionSettings as org.openpnp.model.BottomVisionSettings);
    }

    if (payload.fiducialVision === null) {
        pkg.setFiducialVisionSettings(null as any);
    } else {
        const fiducialVisionSettings = config.getVisionSettings(payload.fiducialVision);
        if (!fiducialVisionSettings) {
            throw createHttpError(400, "Fiducial vision settings not found: " + payload.fiducialVision);
        }
        pkg.setFiducialVisionSettings(fiducialVisionSettings as org.openpnp.model.FiducialVisionSettings);
    }
}

@Route("api/packages")
export class PackagesController extends Controller {
    @Get()
    public listPackages(): PackageDto[] {
        const packages = listFromCollection<org.openpnp.model.Package>(config.getPackages());
        const result: PackageDto[] = [];
        for (let i = 0; i < packages.length; i++) {
            result.push(toPackageDto(packages[i]));
        }
        return result;
    }

    @Get("{id}")
    public getPackageById(@Path() id: string): PackageDto {
        const pkg = config.getPackage(id);
        if (!pkg) {
            throw createHttpError(404, "Package not found: " + id);
        }
        return toPackageDto(pkg);
    }

    @SuccessResponse("201", "Created")
    @Post()
    public createPackage(@Body() body: CreatePackageRequest): PackageDto {
        const payload = validatePackagePayload(body.pkg);
        if (config.getPackage(payload.id)) {
            throw createHttpError(409, "Package already exists: " + payload.id);
        }

        const pkg = new PackageClass(payload.id);
        applyPackagePayload(pkg, payload);
        config.addPackage(pkg);
        config.save();
        this.setStatus(201);
        return toPackageDto(pkg);
    }

    @Put("{id}")
    public setPackageById(@Path() id: string, @Body() body: SetPackageByIdRequest): PackageDto {
        const payload = validatePackagePayload(body.pkg);
        if (payload.id !== id) {
            throw createHttpError(400, "Path id does not match body.pkg.id.");
        }

        const existing = config.getPackage(id);
        const pkg = existing || new PackageClass(id);
        applyPackagePayload(pkg, payload);
        if (!existing) {
            config.addPackage(pkg);
        }
        config.save();
        return toPackageDto(pkg);
    }

    @Delete("{id}")
    public deletePackageById(@Path() id: string): DeletePackageResponse {
        const pkg = config.getPackage(id);
        if (!pkg) {
            throw createHttpError(404, "Package not found: " + id);
        }
        config.removePackage(pkg);
        config.save();
        return { deleted: true };
    }
}
