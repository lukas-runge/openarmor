export function listFromCollection<T>(collection: any): T[] {
    if (!collection) {
        return [];
    }

    const javaArray = collection.toArray();
    const items: T[] = [];
    for (let i = 0; i < javaArray.length; i++) {
        items.push(javaArray[i] as T);
    }
    return items;
}

export function createHttpError(status: number, message: string): Error {
    const err = new Error(message) as Error & { status?: number };
    err.status = status;
    return err;
}

export function validateNumberField(value: unknown, fieldName: string): number | null {
    if (value === null) {
        return null;
    }
    if (typeof value !== "number" || !isFinite(value)) {
        throw createHttpError(400, "Field '" + fieldName + "' must be a number or null.");
    }
    return value;
}

export function validateStringField(value: unknown, fieldName: string): string | null {
    if (value === null) {
        return null;
    }
    if (typeof value !== "string") {
        throw createHttpError(400, "Field '" + fieldName + "' must be a string or null.");
    }
    return value;
}

export function toLengthValue(length: org.openpnp.model.Length | null): number | null {
    if (!length) {
        return null;
    }
    return Number(length.getValue());
}
