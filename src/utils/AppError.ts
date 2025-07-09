export class AppError extends Error {
  statusCode: number;
  originalError?: any;

  constructor(message: string, statusCode = 500, originalError?: any) {
    super(message);
    this.statusCode = statusCode;
    this.originalError = originalError;

    Error.captureStackTrace(this, this.constructor);
  }
}
