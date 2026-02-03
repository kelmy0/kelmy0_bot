import { PrismaClientKnownRequestError } from "../../generated/prisma/internal/prismaNamespace.js";
import { ServiceResponse } from "../../types/ServiceResponse.js";

export function isPrismaError(
  error: unknown,
): error is PrismaClientKnownRequestError {
  return error instanceof Error && "code" in error;
}

export function handlePrismaError(
  error: unknown,
  handlers: {
    [code: string]: (error: PrismaClientKnownRequestError) => ServiceResponse;
  },
): ServiceResponse {
  if (!isPrismaError(error)) {
    throw error;
  }

  const handler = handlers[error.code];
  if (handler) {
    return handler(error);
  }

  throw error;
}

export const PrismaErrorHandlers = {
  duplicateEntry(message: string, errorCode: string = "DUPLICATE_ENTRY") {
    return (error: PrismaClientKnownRequestError) =>
      ServiceResponse.error(message, errorCode);
  },

  notFound(message: string, errorCode: string = "NOT_FOUND") {
    return (error: PrismaClientKnownRequestError) =>
      ServiceResponse.error(message, errorCode);
  },
};
