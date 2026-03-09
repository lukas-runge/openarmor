/* tslint:disable */
/* eslint-disable */
// WARNING: This file was auto-generated with tsoa. Please do not modify it.
import { PartsController } from './../src/controllers/PartsController';
import { PackagesController } from './../src/controllers/PackagesController';
import { HealthController } from './../src/controllers/HealthController';
import type { OpenPnpRequest, OpenPnpResponse, OpenPnpWebServer } from 'openpnp-utils';

var ScannerClass = Java.type('java.util.Scanner');

function readRequestBody(req: OpenPnpRequest): string {
  var scanner = new ScannerClass(req.exchange.getRequestBody(), 'UTF-8');
  scanner.useDelimiter('\\A');
  var payload = scanner.hasNext() ? String(scanner.next()) : '';
  scanner.close();
  return payload;
}

function parseJsonBody(req: OpenPnpRequest): any {
  var raw = readRequestBody(req);
  if (!raw) {
    return {};
  }
  return JSON.parse(raw);
}

function parseQueryString(rawQuery: string | null): Record<string, string> {
  var query: Record<string, string> = {};
  if (!rawQuery) {
    return query;
  }

  var pairs = String(rawQuery).split('&');
  var i: number;
  for (i = 0; i < pairs.length; i++) {
    var pair = pairs[i];
    if (!pair) {
      continue;
    }
    var eq = pair.indexOf('=');
    var key = eq >= 0 ? pair.substring(0, eq) : pair;
    var value = eq >= 0 ? pair.substring(eq + 1) : '';
    query[decodeURIComponent(key)] = decodeURIComponent(value);
  }

  return query;
}

function readHeader(req: OpenPnpRequest, name: string): string | undefined {
  var headers = req.exchange.getRequestHeaders();
  var values = headers.get(name);
  if (values && values.size && values.size() > 0) {
    return String(values.get(0));
  }
  values = headers.get(String(name).toLowerCase());
  if (values && values.size && values.size() > 0) {
    return String(values.get(0));
  }
  return undefined;
}

function extractPathParams(actualPath: string, routePath: string): Record<string, string> | null {
  var params: Record<string, string> = {};
  var routeSegments = routePath.split('/');
  var pathSegments = actualPath.split('/');

  if (routeSegments.length !== pathSegments.length) {
    return null;
  }

  var i: number;
  for (i = 0; i < routeSegments.length; i++) {
    var routeSegment = routeSegments[i];
    var pathSegment = pathSegments[i];

    if (routeSegment.charAt(0) === '{' && routeSegment.charAt(routeSegment.length - 1) === '}') {
      var key = routeSegment.substring(1, routeSegment.length - 1);
      params[key] = decodeURIComponent(pathSegment);
      continue;
    }

    if (routeSegment.charAt(0) === ':') {
      var key = routeSegment.substring(1);
      params[key] = decodeURIComponent(pathSegment);
      continue;
    }

    if (routeSegment !== pathSegment) {
      return null;
    }
  }

  return params;
}

function createResponseAdapter(response: OpenPnpResponse): any {
  var statusCode = 200;
  var sent = false;

  return {
    headersSent: false,
    set: function (name: string, value: string): any {
      if (!sent) {
        response.setHeader(name, value);
      }
      return this;
    },
    status: function (code: number): any {
      statusCode = code;
      return this;
    },
    json: function (data: any): any {
      sent = true;
      this.headersSent = true;
      response.json(statusCode, data);
      return this;
    },
    end: function (body?: any): any {
      sent = true;
      this.headersSent = true;
      if (body === undefined || body === null) {
        response.send(statusCode, '', 'application/json; charset=utf-8');
      } else {
        response.send(statusCode, String(body), 'text/plain; charset=utf-8');
      }
      return this;
    },
  };
}

function getArgValue(param: any, pathParams: Record<string, string>, queryParams: Record<string, string>, body: any, request: OpenPnpRequest): any {
  if (param.in === 'path') {
    return pathParams[param.name];
  }
  if (param.in === 'query') {
    return queryParams[param.name];
  }
  if (param.in === 'queries') {
    return queryParams;
  }
  if (param.in === 'body') {
    return body;
  }
  if (param.in === 'body-prop') {
    return body ? body[param.name] : undefined;
  }
  if (param.in === 'request') {
    return request;
  }
  if (param.in === 'header') {
    return readHeader(request, param.name);
  }

  return undefined;
}

function buildValidatedArgs(
  args: Record<string, any>,
  pathParams: Record<string, string>,
  queryParams: Record<string, string>,
  body: any,
  request: OpenPnpRequest
): any[] {
  var values: any[] = [];
  var key: string;
  for (key in args) {
    if (Object.prototype.hasOwnProperty.call(args, key)) {
      values.push(getArgValue(args[key], pathParams, queryParams, body, request));
    }
  }
  return values;
}

function applyControllerHeaders(controller: any, responseAdapter: any): void {
  if (typeof controller.getHeaders !== 'function') {
    return;
  }
  var headers = controller.getHeaders() || {};
  var name: string;
  for (name in headers) {
    if (Object.prototype.hasOwnProperty.call(headers, name)) {
      responseAdapter.set(name, headers[name]);
    }
  }
}

function resolveStatusCode(controller: any, successStatus?: number): number {
  if (typeof controller.getStatus === 'function') {
    var controllerStatus = controller.getStatus();
    if (controllerStatus) {
      return controllerStatus;
    }
  }
  return successStatus || 200;
}

export function RegisterRoutes(app: OpenPnpWebServer) {
  const argsPartsController_listParts: Record<string, any> = {
  };
  const argsPartsController_getPartById: Record<string, any> = {
    id: {"in":"path","name":"id","required":true,"dataType":"string"},
  };
  const argsPartsController_createPart: Record<string, any> = {
    body: {"in":"body","name":"body","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"part":{"ref":"PartDto","required":true}}},
  };
  const argsPartsController_setPartById: Record<string, any> = {
    id: {"in":"path","name":"id","required":true,"dataType":"string"},
    body: {"in":"body","name":"body","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"part":{"ref":"PartDto","required":true}}},
  };
  const argsPartsController_deletePartById: Record<string, any> = {
    id: {"in":"path","name":"id","required":true,"dataType":"string"},
  };
  const argsPackagesController_listPackages: Record<string, any> = {
  };
  const argsPackagesController_getPackageById: Record<string, any> = {
    id: {"in":"path","name":"id","required":true,"dataType":"string"},
  };
  const argsPackagesController_createPackage: Record<string, any> = {
    body: {"in":"body","name":"body","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"package":{"ref":"PackageDto","required":true}}},
  };
  const argsPackagesController_setPackageById: Record<string, any> = {
    id: {"in":"path","name":"id","required":true,"dataType":"string"},
    body: {"in":"body","name":"body","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"package":{"ref":"PackageDto","required":true}}},
  };
  const argsPackagesController_deletePackageById: Record<string, any> = {
    id: {"in":"path","name":"id","required":true,"dataType":"string"},
  };
  const argsHealthController_check: Record<string, any> = {
  };

  app.all('/api', function dispatchApiRoutes(request: OpenPnpRequest, response: OpenPnpResponse) {
    var body = parseJsonBody(request);
    var queryParams = parseQueryString(request.query);
    var method = String(request.method || '').toLowerCase();
    var matchedPath = false;

    {
      var pathParamsPartsController_listParts = extractPathParams(request.path, '/api/parts');
      if (pathParamsPartsController_listParts) {
        matchedPath = true;
        if (method === 'get') {
          try {
            var responseAdapterPartsController_listParts = createResponseAdapter(response);
            var validatedArgsPartsController_listParts = buildValidatedArgs(argsPartsController_listParts, pathParamsPartsController_listParts, queryParams, body, request);
            var controllerPartsController_listParts = new PartsController();
            var resultPartsController_listParts = (controllerPartsController_listParts as any)['listParts'].apply(controllerPartsController_listParts, validatedArgsPartsController_listParts);

            var handleSuccess = function (data: any): void {
              var statusCode = resolveStatusCode(controllerPartsController_listParts, undefined);
              applyControllerHeaders(controllerPartsController_listParts, responseAdapterPartsController_listParts);
              if (data === undefined || data === null) {
                responseAdapterPartsController_listParts.status(statusCode || 204).end();
              } else {
                responseAdapterPartsController_listParts.status(statusCode || 200).json(data);
              }
            };

            var handleError = function (err: any): void {
              var status = err && err.status ? err.status : 400;
              response.text(status, String(err));
            };

            if (resultPartsController_listParts && typeof (resultPartsController_listParts as any).then === 'function') {
              (resultPartsController_listParts as any).then(handleSuccess, handleError);
              return;
            }

            handleSuccess(resultPartsController_listParts);
            return;
          } catch (err) {
            var status = (err as any) && (err as any).status ? (err as any).status : 400;
            response.text(status, String(err));
            return;
          }
        }
      }
    }
    {
      var pathParamsPartsController_getPartById = extractPathParams(request.path, '/api/parts/:id');
      if (pathParamsPartsController_getPartById) {
        matchedPath = true;
        if (method === 'get') {
          try {
            var responseAdapterPartsController_getPartById = createResponseAdapter(response);
            var validatedArgsPartsController_getPartById = buildValidatedArgs(argsPartsController_getPartById, pathParamsPartsController_getPartById, queryParams, body, request);
            var controllerPartsController_getPartById = new PartsController();
            var resultPartsController_getPartById = (controllerPartsController_getPartById as any)['getPartById'].apply(controllerPartsController_getPartById, validatedArgsPartsController_getPartById);

            var handleSuccess = function (data: any): void {
              var statusCode = resolveStatusCode(controllerPartsController_getPartById, undefined);
              applyControllerHeaders(controllerPartsController_getPartById, responseAdapterPartsController_getPartById);
              if (data === undefined || data === null) {
                responseAdapterPartsController_getPartById.status(statusCode || 204).end();
              } else {
                responseAdapterPartsController_getPartById.status(statusCode || 200).json(data);
              }
            };

            var handleError = function (err: any): void {
              var status = err && err.status ? err.status : 400;
              response.text(status, String(err));
            };

            if (resultPartsController_getPartById && typeof (resultPartsController_getPartById as any).then === 'function') {
              (resultPartsController_getPartById as any).then(handleSuccess, handleError);
              return;
            }

            handleSuccess(resultPartsController_getPartById);
            return;
          } catch (err) {
            var status = (err as any) && (err as any).status ? (err as any).status : 400;
            response.text(status, String(err));
            return;
          }
        }
      }
    }
    {
      var pathParamsPartsController_createPart = extractPathParams(request.path, '/api/parts');
      if (pathParamsPartsController_createPart) {
        matchedPath = true;
        if (method === 'post') {
          try {
            var responseAdapterPartsController_createPart = createResponseAdapter(response);
            var validatedArgsPartsController_createPart = buildValidatedArgs(argsPartsController_createPart, pathParamsPartsController_createPart, queryParams, body, request);
            var controllerPartsController_createPart = new PartsController();
            var resultPartsController_createPart = (controllerPartsController_createPart as any)['createPart'].apply(controllerPartsController_createPart, validatedArgsPartsController_createPart);

            var handleSuccess = function (data: any): void {
              var statusCode = resolveStatusCode(controllerPartsController_createPart, 201);
              applyControllerHeaders(controllerPartsController_createPart, responseAdapterPartsController_createPart);
              if (data === undefined || data === null) {
                responseAdapterPartsController_createPart.status(statusCode || 204).end();
              } else {
                responseAdapterPartsController_createPart.status(statusCode || 200).json(data);
              }
            };

            var handleError = function (err: any): void {
              var status = err && err.status ? err.status : 400;
              response.text(status, String(err));
            };

            if (resultPartsController_createPart && typeof (resultPartsController_createPart as any).then === 'function') {
              (resultPartsController_createPart as any).then(handleSuccess, handleError);
              return;
            }

            handleSuccess(resultPartsController_createPart);
            return;
          } catch (err) {
            var status = (err as any) && (err as any).status ? (err as any).status : 400;
            response.text(status, String(err));
            return;
          }
        }
      }
    }
    {
      var pathParamsPartsController_setPartById = extractPathParams(request.path, '/api/parts/:id');
      if (pathParamsPartsController_setPartById) {
        matchedPath = true;
        if (method === 'put') {
          try {
            var responseAdapterPartsController_setPartById = createResponseAdapter(response);
            var validatedArgsPartsController_setPartById = buildValidatedArgs(argsPartsController_setPartById, pathParamsPartsController_setPartById, queryParams, body, request);
            var controllerPartsController_setPartById = new PartsController();
            var resultPartsController_setPartById = (controllerPartsController_setPartById as any)['setPartById'].apply(controllerPartsController_setPartById, validatedArgsPartsController_setPartById);

            var handleSuccess = function (data: any): void {
              var statusCode = resolveStatusCode(controllerPartsController_setPartById, undefined);
              applyControllerHeaders(controllerPartsController_setPartById, responseAdapterPartsController_setPartById);
              if (data === undefined || data === null) {
                responseAdapterPartsController_setPartById.status(statusCode || 204).end();
              } else {
                responseAdapterPartsController_setPartById.status(statusCode || 200).json(data);
              }
            };

            var handleError = function (err: any): void {
              var status = err && err.status ? err.status : 400;
              response.text(status, String(err));
            };

            if (resultPartsController_setPartById && typeof (resultPartsController_setPartById as any).then === 'function') {
              (resultPartsController_setPartById as any).then(handleSuccess, handleError);
              return;
            }

            handleSuccess(resultPartsController_setPartById);
            return;
          } catch (err) {
            var status = (err as any) && (err as any).status ? (err as any).status : 400;
            response.text(status, String(err));
            return;
          }
        }
      }
    }
    {
      var pathParamsPartsController_deletePartById = extractPathParams(request.path, '/api/parts/:id');
      if (pathParamsPartsController_deletePartById) {
        matchedPath = true;
        if (method === 'delete') {
          try {
            var responseAdapterPartsController_deletePartById = createResponseAdapter(response);
            var validatedArgsPartsController_deletePartById = buildValidatedArgs(argsPartsController_deletePartById, pathParamsPartsController_deletePartById, queryParams, body, request);
            var controllerPartsController_deletePartById = new PartsController();
            var resultPartsController_deletePartById = (controllerPartsController_deletePartById as any)['deletePartById'].apply(controllerPartsController_deletePartById, validatedArgsPartsController_deletePartById);

            var handleSuccess = function (data: any): void {
              var statusCode = resolveStatusCode(controllerPartsController_deletePartById, undefined);
              applyControllerHeaders(controllerPartsController_deletePartById, responseAdapterPartsController_deletePartById);
              if (data === undefined || data === null) {
                responseAdapterPartsController_deletePartById.status(statusCode || 204).end();
              } else {
                responseAdapterPartsController_deletePartById.status(statusCode || 200).json(data);
              }
            };

            var handleError = function (err: any): void {
              var status = err && err.status ? err.status : 400;
              response.text(status, String(err));
            };

            if (resultPartsController_deletePartById && typeof (resultPartsController_deletePartById as any).then === 'function') {
              (resultPartsController_deletePartById as any).then(handleSuccess, handleError);
              return;
            }

            handleSuccess(resultPartsController_deletePartById);
            return;
          } catch (err) {
            var status = (err as any) && (err as any).status ? (err as any).status : 400;
            response.text(status, String(err));
            return;
          }
        }
      }
    }
    {
      var pathParamsPackagesController_listPackages = extractPathParams(request.path, '/api/packages');
      if (pathParamsPackagesController_listPackages) {
        matchedPath = true;
        if (method === 'get') {
          try {
            var responseAdapterPackagesController_listPackages = createResponseAdapter(response);
            var validatedArgsPackagesController_listPackages = buildValidatedArgs(argsPackagesController_listPackages, pathParamsPackagesController_listPackages, queryParams, body, request);
            var controllerPackagesController_listPackages = new PackagesController();
            var resultPackagesController_listPackages = (controllerPackagesController_listPackages as any)['listPackages'].apply(controllerPackagesController_listPackages, validatedArgsPackagesController_listPackages);

            var handleSuccess = function (data: any): void {
              var statusCode = resolveStatusCode(controllerPackagesController_listPackages, undefined);
              applyControllerHeaders(controllerPackagesController_listPackages, responseAdapterPackagesController_listPackages);
              if (data === undefined || data === null) {
                responseAdapterPackagesController_listPackages.status(statusCode || 204).end();
              } else {
                responseAdapterPackagesController_listPackages.status(statusCode || 200).json(data);
              }
            };

            var handleError = function (err: any): void {
              var status = err && err.status ? err.status : 400;
              response.text(status, String(err));
            };

            if (resultPackagesController_listPackages && typeof (resultPackagesController_listPackages as any).then === 'function') {
              (resultPackagesController_listPackages as any).then(handleSuccess, handleError);
              return;
            }

            handleSuccess(resultPackagesController_listPackages);
            return;
          } catch (err) {
            var status = (err as any) && (err as any).status ? (err as any).status : 400;
            response.text(status, String(err));
            return;
          }
        }
      }
    }
    {
      var pathParamsPackagesController_getPackageById = extractPathParams(request.path, '/api/packages/:id');
      if (pathParamsPackagesController_getPackageById) {
        matchedPath = true;
        if (method === 'get') {
          try {
            var responseAdapterPackagesController_getPackageById = createResponseAdapter(response);
            var validatedArgsPackagesController_getPackageById = buildValidatedArgs(argsPackagesController_getPackageById, pathParamsPackagesController_getPackageById, queryParams, body, request);
            var controllerPackagesController_getPackageById = new PackagesController();
            var resultPackagesController_getPackageById = (controllerPackagesController_getPackageById as any)['getPackageById'].apply(controllerPackagesController_getPackageById, validatedArgsPackagesController_getPackageById);

            var handleSuccess = function (data: any): void {
              var statusCode = resolveStatusCode(controllerPackagesController_getPackageById, undefined);
              applyControllerHeaders(controllerPackagesController_getPackageById, responseAdapterPackagesController_getPackageById);
              if (data === undefined || data === null) {
                responseAdapterPackagesController_getPackageById.status(statusCode || 204).end();
              } else {
                responseAdapterPackagesController_getPackageById.status(statusCode || 200).json(data);
              }
            };

            var handleError = function (err: any): void {
              var status = err && err.status ? err.status : 400;
              response.text(status, String(err));
            };

            if (resultPackagesController_getPackageById && typeof (resultPackagesController_getPackageById as any).then === 'function') {
              (resultPackagesController_getPackageById as any).then(handleSuccess, handleError);
              return;
            }

            handleSuccess(resultPackagesController_getPackageById);
            return;
          } catch (err) {
            var status = (err as any) && (err as any).status ? (err as any).status : 400;
            response.text(status, String(err));
            return;
          }
        }
      }
    }
    {
      var pathParamsPackagesController_createPackage = extractPathParams(request.path, '/api/packages');
      if (pathParamsPackagesController_createPackage) {
        matchedPath = true;
        if (method === 'post') {
          try {
            var responseAdapterPackagesController_createPackage = createResponseAdapter(response);
            var validatedArgsPackagesController_createPackage = buildValidatedArgs(argsPackagesController_createPackage, pathParamsPackagesController_createPackage, queryParams, body, request);
            var controllerPackagesController_createPackage = new PackagesController();
            var resultPackagesController_createPackage = (controllerPackagesController_createPackage as any)['createPackage'].apply(controllerPackagesController_createPackage, validatedArgsPackagesController_createPackage);

            var handleSuccess = function (data: any): void {
              var statusCode = resolveStatusCode(controllerPackagesController_createPackage, 201);
              applyControllerHeaders(controllerPackagesController_createPackage, responseAdapterPackagesController_createPackage);
              if (data === undefined || data === null) {
                responseAdapterPackagesController_createPackage.status(statusCode || 204).end();
              } else {
                responseAdapterPackagesController_createPackage.status(statusCode || 200).json(data);
              }
            };

            var handleError = function (err: any): void {
              var status = err && err.status ? err.status : 400;
              response.text(status, String(err));
            };

            if (resultPackagesController_createPackage && typeof (resultPackagesController_createPackage as any).then === 'function') {
              (resultPackagesController_createPackage as any).then(handleSuccess, handleError);
              return;
            }

            handleSuccess(resultPackagesController_createPackage);
            return;
          } catch (err) {
            var status = (err as any) && (err as any).status ? (err as any).status : 400;
            response.text(status, String(err));
            return;
          }
        }
      }
    }
    {
      var pathParamsPackagesController_setPackageById = extractPathParams(request.path, '/api/packages/:id');
      if (pathParamsPackagesController_setPackageById) {
        matchedPath = true;
        if (method === 'put') {
          try {
            var responseAdapterPackagesController_setPackageById = createResponseAdapter(response);
            var validatedArgsPackagesController_setPackageById = buildValidatedArgs(argsPackagesController_setPackageById, pathParamsPackagesController_setPackageById, queryParams, body, request);
            var controllerPackagesController_setPackageById = new PackagesController();
            var resultPackagesController_setPackageById = (controllerPackagesController_setPackageById as any)['setPackageById'].apply(controllerPackagesController_setPackageById, validatedArgsPackagesController_setPackageById);

            var handleSuccess = function (data: any): void {
              var statusCode = resolveStatusCode(controllerPackagesController_setPackageById, undefined);
              applyControllerHeaders(controllerPackagesController_setPackageById, responseAdapterPackagesController_setPackageById);
              if (data === undefined || data === null) {
                responseAdapterPackagesController_setPackageById.status(statusCode || 204).end();
              } else {
                responseAdapterPackagesController_setPackageById.status(statusCode || 200).json(data);
              }
            };

            var handleError = function (err: any): void {
              var status = err && err.status ? err.status : 400;
              response.text(status, String(err));
            };

            if (resultPackagesController_setPackageById && typeof (resultPackagesController_setPackageById as any).then === 'function') {
              (resultPackagesController_setPackageById as any).then(handleSuccess, handleError);
              return;
            }

            handleSuccess(resultPackagesController_setPackageById);
            return;
          } catch (err) {
            var status = (err as any) && (err as any).status ? (err as any).status : 400;
            response.text(status, String(err));
            return;
          }
        }
      }
    }
    {
      var pathParamsPackagesController_deletePackageById = extractPathParams(request.path, '/api/packages/:id');
      if (pathParamsPackagesController_deletePackageById) {
        matchedPath = true;
        if (method === 'delete') {
          try {
            var responseAdapterPackagesController_deletePackageById = createResponseAdapter(response);
            var validatedArgsPackagesController_deletePackageById = buildValidatedArgs(argsPackagesController_deletePackageById, pathParamsPackagesController_deletePackageById, queryParams, body, request);
            var controllerPackagesController_deletePackageById = new PackagesController();
            var resultPackagesController_deletePackageById = (controllerPackagesController_deletePackageById as any)['deletePackageById'].apply(controllerPackagesController_deletePackageById, validatedArgsPackagesController_deletePackageById);

            var handleSuccess = function (data: any): void {
              var statusCode = resolveStatusCode(controllerPackagesController_deletePackageById, undefined);
              applyControllerHeaders(controllerPackagesController_deletePackageById, responseAdapterPackagesController_deletePackageById);
              if (data === undefined || data === null) {
                responseAdapterPackagesController_deletePackageById.status(statusCode || 204).end();
              } else {
                responseAdapterPackagesController_deletePackageById.status(statusCode || 200).json(data);
              }
            };

            var handleError = function (err: any): void {
              var status = err && err.status ? err.status : 400;
              response.text(status, String(err));
            };

            if (resultPackagesController_deletePackageById && typeof (resultPackagesController_deletePackageById as any).then === 'function') {
              (resultPackagesController_deletePackageById as any).then(handleSuccess, handleError);
              return;
            }

            handleSuccess(resultPackagesController_deletePackageById);
            return;
          } catch (err) {
            var status = (err as any) && (err as any).status ? (err as any).status : 400;
            response.text(status, String(err));
            return;
          }
        }
      }
    }
    {
      var pathParamsHealthController_check = extractPathParams(request.path, '/api/health');
      if (pathParamsHealthController_check) {
        matchedPath = true;
        if (method === 'get') {
          try {
            var responseAdapterHealthController_check = createResponseAdapter(response);
            var validatedArgsHealthController_check = buildValidatedArgs(argsHealthController_check, pathParamsHealthController_check, queryParams, body, request);
            var controllerHealthController_check = new HealthController();
            var resultHealthController_check = (controllerHealthController_check as any)['check'].apply(controllerHealthController_check, validatedArgsHealthController_check);

            var handleSuccess = function (data: any): void {
              var statusCode = resolveStatusCode(controllerHealthController_check, undefined);
              applyControllerHeaders(controllerHealthController_check, responseAdapterHealthController_check);
              if (data === undefined || data === null) {
                responseAdapterHealthController_check.status(statusCode || 204).end();
              } else {
                responseAdapterHealthController_check.status(statusCode || 200).json(data);
              }
            };

            var handleError = function (err: any): void {
              var status = err && err.status ? err.status : 400;
              response.text(status, String(err));
            };

            if (resultHealthController_check && typeof (resultHealthController_check as any).then === 'function') {
              (resultHealthController_check as any).then(handleSuccess, handleError);
              return;
            }

            handleSuccess(resultHealthController_check);
            return;
          } catch (err) {
            var status = (err as any) && (err as any).status ? (err as any).status : 400;
            response.text(status, String(err));
            return;
          }
        }
      }
    }

    if (matchedPath) {
      response.text(405, 'Method not allowed: ' + request.method);
      return;
    }

    response.text(404, 'Not found');
  });
}
