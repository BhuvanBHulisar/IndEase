export const errorHandler = (err, req, res, next) => {
    console.error(`[Error] ${err.message}`);

    let status = err.statusCode || 500;
    let message = err.message || 'Internal operational failure';

    // Handle Zod Validation Errors
    if (err.name === 'ZodError' || err.issues) {
        status = 400;
        const firstIssue = err.issues?.[0];
        message = firstIssue ? `${firstIssue.path.join('.')}: ${firstIssue.message}` : 'Validation failure';
    }

    res.status(status).json({
        status: 'error',
        statusCode: status,
        message
    });
};

export class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}
