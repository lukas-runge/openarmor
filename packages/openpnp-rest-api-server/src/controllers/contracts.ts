export interface PartDto {
    id: string;
    name: string | null;
    height: number | null;
    throughBoardDepth: number | null;
    package: string | null;
    speed: number | null;
    bottomVision: string | null;
    fiducialVision: string | null;
}

export interface CreatePartRequest {
    part: PartDto;
}

export interface SetPartByIdRequest {
    part: PartDto;
}

export interface DeletePartResponse {
    deleted: true;
}

export interface PackageDto {
    id: string;
    description: string | null;
    tapeSpecification: string | null;
    pickVacuumLevel: number | null;
    placeBlowOffLevel: number | null;
    bottomVision: string | null;
    fiducialVision: string | null;
}

export interface CreatePackageRequest {
    pkg: PackageDto;
}

export interface SetPackageByIdRequest {
    pkg: PackageDto;
}

export interface DeletePackageResponse {
    deleted: true;
}

export interface HealthResponse {
    status: "OK";
    message: string;
}
