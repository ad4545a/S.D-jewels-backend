// User-friendly error messages mapping
const getUserFriendlyMessage = (error, statusCode) => {
    const message = error.message?.toLowerCase() || '';

    // Authentication errors
    if (message.includes('not authorized') || message.includes('token')) {
        return 'Please log in to continue';
    }
    if (message.includes('invalid email or password')) {
        return 'Email or password is incorrect. Please try again.';
    }
    if (message.includes('already reviewed')) {
        return 'You have already submitted a review for this product';
    }
    if (message.includes('user already exists')) {
        return 'An account with this email already exists';
    }

    // Validation errors
    if (message.includes('password must be')) {
        return 'Password must be at least 8 characters with uppercase, lowercase, and number';
    }
    if (message.includes('valid email')) {
        return 'Please enter a valid email address';
    }
    if (message.includes('required')) {
        return 'Please fill in all required fields';
    }

    // Not found errors
    if (statusCode === 404 || message.includes('not found')) {
        return 'The requested item could not be found';
    }

    // Rate limiting
    if (message.includes('too many')) {
        return 'Too many attempts. Please wait a few minutes and try again.';
    }

    // Server errors
    if (statusCode >= 500) {
        return 'Something went wrong. Please try again later.';
    }

    // Default: return original message if it's already user-friendly
    if (error.message && error.message.length < 100) {
        return error.message;
    }

    return 'An unexpected error occurred. Please try again.';
};

const notFound = (req, res, next) => {
    const error = new Error('Page not found');
    res.status(404);
    next(error);
};

const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    const userFriendlyMessage = getUserFriendlyMessage(err, statusCode);

    // Log technical error for debugging (only in development)
    if (process.env.NODE_ENV !== 'production') {
        console.error('Error:', err.message);
    }

    res.status(statusCode);
    res.json({
        success: false,
        message: userFriendlyMessage,
        // Only include stack in development
        ...(process.env.NODE_ENV !== 'production' && { debug: err.message })
    });
};

module.exports = { notFound, errorHandler };

