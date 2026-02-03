export interface ServiceSuccess<T = any> {
  success: true;
  message: string;
  data?: T;
  timestamp: Date;
}

export interface ServiceError {
  success: false;
  message: string;
  errorCode?: string;
  timestamp: Date;
}

export type ServiceResponse<T = any> = ServiceSuccess<T> | ServiceError;

// Helpers
export const ServiceResponse = {
  success<T>(message: string, data?: T): ServiceSuccess<T> {
    return {
      success: true,
      message,
      data,
      timestamp: new Date(),
    };
  },

  error(message: string, errorCode?: string): ServiceError {
    return {
      success: false,
      message,
      errorCode,
      timestamp: new Date(),
    };
  },
};
