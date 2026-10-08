export interface FieldError {
  field: string;
  message: string;
}

/** Operational error that is safe to show to the client. */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly errors?: FieldError[],
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const badRequest = (m = 'Bad request') => new AppError(400, m);
export const unauthorized = (m = 'Authentication required') => new AppError(401, m);
export const forbidden = (m = 'You do not have permission to perform this action') => new AppError(403, m);
export const notFound = (m = 'Resource not found') => new AppError(404, m);
export const conflict = (m = 'Conflict') => new AppError(409, m);
export const validationError = (errors: FieldError[], m = 'Validation failed') => new AppError(422, m, errors);
