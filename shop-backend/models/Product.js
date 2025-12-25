const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema({
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
}, {
    timestamps: true,
});

const productSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    name: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    images: [{
        type: String
    }],
    description: {
        type: String,
        required: true,
    },
    brand: {
        type: String,
        required: true,
        default: 'S.D. Jewels'
    },
    productDetails: {
        type: String,
        required: false,
    },
    weight: {
        type: String, // String to allow "5g" or "5.5 grams"
        required: false,
    },
    carat: {
        type: String, // String for "24k" or "18 karat"
        required: false,
    },
    category: [{
        type: String,
        required: true,
    }],
    material: {
        type: String,
        required: false,
    },
    // --- New Jewelry Attributes ---
    style: [{ type: String }],
    metalType: [{ type: String }],
    metalColor: [{ type: String }],
    stoneType: [{ type: String }],
    gender: [{ type: String }],
    occasion: [{ type: String }],
    collectionName: [{ type: String }],
    // ------------------------------
    size: {
        type: String, // Ring size
        required: false,
    },
    price: {
        type: Number,
        required: true,
        default: 0,
    },
    countInStock: {
        type: Number,
        required: true,
        default: 0,
    },
    rating: {
        type: Number,
        required: true,
        default: 0,
    },
    numReviews: {
        type: Number,
        required: true,
        default: 0,
    },
    reviews: [reviewSchema], // Embedded reviews for simplicity
    featured: {
        type: Boolean,
        default: false,
    }
}, {
    timestamps: true,
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
