const validator = require('validator');

// Sanitize string inputs
const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return validator.escape(validator.trim(str));
};

// Validate email format
const isValidEmail = (email) => {
    return validator.isEmail(email);
};

// Validate password strength (min 8 chars, 1 uppercase, 1 lowercase, 1 number)
const isStrongPassword = (password) => {
    return validator.isStrongPassword(password, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 0 // Optional: set to 1 for requiring special chars
    });
};

// Validate MongoDB ObjectId
const isValidObjectId = (id) => {
    return validator.isMongoId(id);
};

// Validate phone number (basic validation)
const isValidPhone = (phone) => {
    if (!phone) return true; // Phone is optional
    return validator.isMobilePhone(phone, 'any');
};

// Middleware to validate user registration
const validateUserRegistration = (req, res, next) => {
    const { name, email, password, phone } = req.body;
    const errors = [];

    if (!name || name.trim().length < 2) {
        errors.push('Name must be at least 2 characters');
    }

    if (!email || !isValidEmail(email)) {
        errors.push('Please provide a valid email address');
    }

    if (!password || !isStrongPassword(password)) {
        errors.push('Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number');
    }

    if (phone && !isValidPhone(phone)) {
        errors.push('Please provide a valid phone number');
    }

    if (errors.length > 0) {
        res.status(400);
        return res.json({ message: errors.join(', ') });
    }

    // Sanitize inputs
    req.body.name = sanitizeString(name);
    req.body.email = validator.normalizeEmail(email);

    next();
};

// Middleware to validate login
const validateLogin = (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400);
        return res.json({ message: 'Email and password are required' });
    }

    if (!isValidEmail(email)) {
        res.status(400);
        return res.json({ message: 'Please provide a valid email address' });
    }

    req.body.email = validator.normalizeEmail(email);
    next();
};

// Middleware to validate ObjectId params
const validateObjectId = (req, res, next) => {
    const { id } = req.params;

    if (id && !isValidObjectId(id)) {
        res.status(400);
        return res.json({ message: 'Invalid ID format' });
    }

    next();
};

// Middleware to validate product data
const validateProduct = (req, res, next) => {
    const { name, price, description, countInStock } = req.body;
    const errors = [];

    if (!name || name.trim().length < 2) {
        errors.push('Product name must be at least 2 characters');
    }

    if (price === undefined || price < 0) {
        errors.push('Price must be a positive number');
    }

    if (!description || description.trim().length < 10) {
        errors.push('Description must be at least 10 characters');
    }

    if (countInStock !== undefined && countInStock < 0) {
        errors.push('Stock count cannot be negative');
    }

    if (errors.length > 0) {
        res.status(400);
        return res.json({ message: errors.join(', ') });
    }

    // Sanitize
    req.body.name = sanitizeString(name);
    req.body.description = sanitizeString(description);

    next();
};

// Middleware to validate review
const validateReview = (req, res, next) => {
    const { rating, comment } = req.body;
    const errors = [];

    if (!rating || rating < 1 || rating > 5) {
        errors.push('Rating must be between 1 and 5');
    }

    if (!comment || comment.trim().length < 5) {
        errors.push('Comment must be at least 5 characters');
    }

    if (errors.length > 0) {
        res.status(400);
        return res.json({ message: errors.join(', ') });
    }

    req.body.comment = sanitizeString(comment);
    next();
};

module.exports = {
    sanitizeString,
    isValidEmail,
    isStrongPassword,
    isValidObjectId,
    isValidPhone,
    validateUserRegistration,
    validateLogin,
    validateObjectId,
    validateProduct,
    validateReview
};
