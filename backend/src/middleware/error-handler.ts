import type { Context, Next } from 'hono';
import { AppError } from '../utils/errors.js';
import { config } from '../config/index.js';

export async function errorHandler(c: Context, next: Next) {
  try {
    await next();
  } catch (error) {
    console.error('Error:', error);

    if (error instanceof AppError) {
      return c.json(
        {
          success: false,
          error: error.message,
          code: error.code,
        },
        error.statusCode as 400 | 404 | 422 | 500 | 503
      );
    }

    // Unknown error
    const message = config.isDev && error instanceof Error
      ? error.message
      : 'Internal server error';

    return c.json(
      {
        success: false,
        error: message,
        code: 'INTERNAL_ERROR',
      },
      500
    );
  }
}

export function notFound(c: Context) {
  return c.json(
    {
      success: false,
      error: 'Not found',
      code: 'NOT_FOUND',
    },
    404
  );
}
