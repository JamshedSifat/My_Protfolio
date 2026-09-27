import type { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    public detail: unknown,
  ) {
    super(typeof detail === "string" ? detail : code);
  }
}

export const notFound = (request: Request, _response: Response, next: NextFunction) => {
  next(new ApiError(404, "not_found", `No route matches ${request.method} ${request.path}`));
};

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof ZodError) {
    return response.status(400).json({
      error: { status: 400, code: "validation_error", detail: error.flatten().fieldErrors },
    });
  }
  if (error instanceof ApiError) {
    return response.status(error.status).json({
      error: { status: error.status, code: error.code, detail: error.detail },
    });
  }
  if (error?.code === "23505") {
    return response.status(409).json({
      error: { status: 409, code: "conflict", detail: "That value already exists." },
    });
  }
  console.error(error);
  return response.status(500).json({
    error: { status: 500, code: "server_error", detail: "An unexpected server error occurred." },
  });
};