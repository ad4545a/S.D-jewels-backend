const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const Order = require('../models/Order');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
    const keyword = req.query.keyword
        ? {
            name: {
                $regex: req.query.keyword,
                $options: 'i',
            },
        }
        : {};

    const products = await Product.find({ ...keyword });
    res.json(products);
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        res.json(product);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        await Product.deleteOne({ _id: product._id });
        res.json({ message: 'Product removed' });
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
    const { name, price, description, image, brand, category, countInStock, material, size } = req.body;

    const product = new Product({
        name: name || 'Sample Name',
        price: price || 0,
        user: req.user._id,
        image: image || '/images/sample.jpg',
        brand: brand || 'Sample Brand',
        category: category || 'Sample Category',
        countInStock: countInStock || 0,
        numReviews: 0,
        description: description || 'Sample description',
        productDetails: req.body.productDetails || 'Material: Gold, Gemstone: Diamond',
        weight: req.body.weight || '0g',
        carat: req.body.carat || '0k',
        material: material || 'Gold',
        size: size || '',
        style: req.body.style || [],
        metalType: req.body.metalType || [],
        metalColor: req.body.metalColor || [],
        stoneType: req.body.stoneType || [],
        gender: req.body.gender || [],
        occasion: req.body.occasion || [],
        collectionName: req.body.collectionName || [],
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
    const {
        name,
        price,
        description,
        image,
        brand,
        category,
        countInStock,
        productDetails,
        weight,
        carat,
        material,
        size,
        style,
        metalType,
        metalColor,
        stoneType,
        gender,
        occasion,
        collectionName,
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
        product.name = name;
        product.price = price;
        product.description = description;
        product.image = image;
        product.brand = brand;
        product.category = category;
        product.countInStock = countInStock;
        product.productDetails = productDetails;
        product.weight = weight;
        product.carat = carat;
        product.material = material;
        product.size = size;
        product.style = style;
        product.metalType = metalType;
        product.metalColor = metalColor;
        product.stoneType = stoneType;
        product.gender = gender;
        product.occasion = occasion;
        product.collectionName = collectionName;
        product.description = description;
        product.image = image;
        product.brand = brand;
        product.category = category;
        product.countInStock = countInStock;
        product.productDetails = productDetails;
        product.weight = weight;
        product.carat = carat;
        product.material = material;
        product.size = size;

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
        // Check if user has already reviewed this product
        const alreadyReviewed = product.reviews.find(
            (r) => r.user.toString() === req.user._id.toString()
        );

        if (alreadyReviewed) {
            res.status(400);
            throw new Error('You have already reviewed this product');
        }

        const review = {
            name: req.user.name,
            rating: Number(rating),
            comment,
            user: req.user._id,
        };

        product.reviews.push(review);

        // Update number of reviews
        product.numReviews = product.reviews.length;

        // Calculate new average rating
        product.rating =
            product.reviews.reduce((acc, item) => item.rating + acc, 0) /
            product.reviews.length;

        await product.save();
        res.status(201).json({ message: 'Review added successfully' });
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Get featured products (best sellers + recommended)
// @route   GET /api/products/analytics/featured
// @access  Public
const getFeaturedProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({});
    const orders = await Order.find({});

    // Calculate best sellers based on order quantity
    const productSales = {};
    orders.forEach(order => {
        order.orderItems?.forEach(item => {
            const key = item.product?.toString();
            if (key) {
                if (!productSales[key]) {
                    productSales[key] = 0;
                }
                productSales[key] += item.qty;
            }
        });
    });

    // Sort products by sales and get top 8
    const bestSellers = products
        .map(p => ({
            ...p.toObject(),
            soldQty: productSales[p._id.toString()] || 0
        }))
        .sort((a, b) => b.soldQty - a.soldQty)
        .slice(0, 8);

    // Get recommended products (highest rated with at least 1 review)
    const recommended = products
        .filter(p => p.numReviews > 0)
        .sort((a, b) => b.rating - a.rating || b.numReviews - a.numReviews)
        .slice(0, 8);

    res.json({
        bestSellers,
        recommended,
        lastUpdated: new Date().toISOString()
    });
});

module.exports = {
    getProducts,
    getProductById,
    deleteProduct,
    createProduct,
    updateProduct,
    createProductReview,
    getFeaturedProducts,
};
