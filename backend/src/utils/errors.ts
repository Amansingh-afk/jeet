export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(
      id ? `${resource} with id '${id}' not found` : `${resource} not found`,
      404,
      'NOT_FOUND'
    );
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class PatternMatchError extends AppError {
  constructor(message: string = 'Could not match question to any pattern') {
    super(message, 422, 'PATTERN_MATCH_FAILED');
    this.name = 'PatternMatchError';
  }
}

export class LLMError extends AppError {
  constructor(message: string = 'LLM service error') {
    super(message, 503, 'LLM_ERROR');
    this.name = 'LLMError';
  }
}
