import { PrismaClient } from "../../generated/prisma/client.js";
import { ServiceResponse } from "../../types/ServiceResponse.js";

export abstract class BaseService {
  protected prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  protected async withTransaction<T>(
    operation: () => Promise<T>
  ): Promise<T> {
    return this.prisma.$transaction(operation);
  }

  protected success<T>(message: string, data?: T): ServiceResponse<T> {
    return ServiceResponse.success(message, data);
  }

  protected error(message: string, errorCode?: string): ServiceResponse {
    return ServiceResponse.error(message, errorCode);
  }
}