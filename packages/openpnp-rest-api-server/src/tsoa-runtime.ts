export class Controller {
    private statusCode?: number;
    private headers: Record<string, string> = {};

    public setStatus(statusCode: number): void {
        this.statusCode = statusCode;
    }

    public getStatus(): number | undefined {
        return this.statusCode;
    }

    public setHeader(name: string, value: string): void {
        this.headers[name] = value;
    }

    public getHeader(name: string): string | undefined {
        return this.headers[name];
    }

    public getHeaders(): Record<string, string> {
        return this.headers;
    }
}

// Decorators are runtime no-ops for Nashorn execution.
export function Route(_value: string): ClassDecorator {
    return function () {};
}

export function Hidden(): MethodDecorator & ClassDecorator {
    return function () {};
}

export function Get(_value?: string): MethodDecorator {
    return function () {};
}

export function Options(_value?: string): MethodDecorator {
    return function () {};
}

export function Post(_value?: string): MethodDecorator {
    return function () {};
}

export function Put(_value?: string): MethodDecorator {
    return function () {};
}

export function Patch(_value?: string): MethodDecorator {
    return function () {};
}

export function Delete(_value?: string): MethodDecorator {
    return function () {};
}

export function Head(_value?: string): MethodDecorator {
    return function () {};
}

export function Path(_value?: string): ParameterDecorator {
    return function () {};
}

export function Body(_value?: string): ParameterDecorator {
    return function () {};
}

export function BodyProp(_value?: string): ParameterDecorator {
    return function () {};
}

export function Query(_value?: string): ParameterDecorator {
    return function () {};
}

export function Queries(): ParameterDecorator {
    return function () {};
}

export function Header(_value?: string): ParameterDecorator {
    return function () {};
}

export function Request(): ParameterDecorator {
    return function () {};
}

export function RequestProp(_value?: string): ParameterDecorator {
    return function () {};
}

export function Inject(): ParameterDecorator {
    return function () {};
}

export function UploadedFile(_value?: string): ParameterDecorator {
    return function () {};
}

export function UploadedFiles(_value?: string): ParameterDecorator {
    return function () {};
}

export function FormField(_value?: string): ParameterDecorator {
    return function () {};
}

export function Consumes(_value: string): MethodDecorator {
    return function () {};
}

export function SuccessResponse(_statusCode: string, _description?: string): MethodDecorator {
    return function () {};
}

export function Response(_statusCode: string, _description?: string): MethodDecorator {
    return function () {};
}

export function Res(): ParameterDecorator {
    return function () {};
}

export function Produces(_value: string): ClassDecorator & MethodDecorator {
    return function () {};
}

export function Security(_name: string | Record<string, string[]>, _scopes?: string[]): MethodDecorator & ClassDecorator {
    return function () {};
}

export function Tags(..._values: string[]): MethodDecorator & ClassDecorator {
    return function () {};
}

export function OperationId(_value: string): MethodDecorator {
    return function () {};
}

export function Deprecated(): MethodDecorator & ClassDecorator {
    return function () {};
}

export function Example<T>(_value: T): MethodDecorator {
    return function () {};
}
