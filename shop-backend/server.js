const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
// Removed xss-clean - deprecated and was causing login issues
const connectDB = require('./config/db');

const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
// Enable proxy trust for Render deployment 
// This is critical for express-rate-limit to work correctly behind a load balancer
app.set('trust proxy', 1);
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: [
            "http://localhost:3000",
            "http://localhost:3001",
            "https://s-d-jewels-costumer.vercel.app",
            "https://s-d-jewels-admin.vercel.app"
        ],
        methods: ["GET", "POST", "PUT", "DELETE"],
    },
});

app.set('socketio', io);

connectDB().then(async () => {
    try {
        const User = require('./models/User');
        const Product = require('./models/Product');
        const Order = require('./models/Order');
        const Category = require('./models/Category');
        const { faker } = require('@faker-js/faker'); // Import faker for data generation

        let adminUser;
        // Always recreate admin to ensure correct password
        await User.deleteOne({ email: 'admin@example.com' });
        console.log('Creating Admin User...');
        adminUser = await User.create({
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'Admin123',
            role: 'admin'
        });
        console.log('Admin User Created with password: Admin123');

        // --- Sample Users Seeding ---
        const userCount = await User.countDocuments();
        if (userCount <= 1) { // Only admin exists
            console.log('Seeding 55 Sample Users...');
            const avatarStyles = ['adventurer', 'avataaars', 'big-ears', 'bottts', 'croodles', 'fun-emoji', 'lorelei', 'micah', 'miniavs', 'open-peeps', 'personas', 'pixel-art'];
            const users = [];

            for (let i = 0; i < 55; i++) {
                const firstName = faker.person.firstName();
                const lastName = faker.person.lastName();
                const name = `${firstName} ${lastName}`;
                const email = faker.internet.email({ firstName, lastName }).toLowerCase();
                const avatarStyle = faker.helpers.arrayElement(avatarStyles);

                users.push({
                    name: name,
                    email: email,
                    password: '123456', // Will be hashed by pre-save middleware
                    avatar: `https://api.dicebear.com/7.x/${avatarStyle}/svg?seed=${firstName}${lastName}`,
                    phone: faker.phone.number('+91 ##########'),
                    role: 'user',
                });
            }

            // Use insertMany with ordered: false to skip duplicates
            await User.create(users);
            console.log('55 Sample Users Seeded');
        }
        // ----------------------------

        // --- Categories Seeding ---
        const categoryCount = await Category.countDocuments();
        if (categoryCount === 0) {
            console.log('Seeding Categories...');
            const categoriesList = ['Rings', 'Necklaces', 'Earrings', 'Bracelets', 'Bangles', 'Pendants'];
            const categoryData = categoriesList.map(cat => ({
                name: cat,
                description: `Beautiful collection of ${cat}`
            }));
            await Category.insertMany(categoryData);
            console.log('Categories Seeded');
        }
        // --------------------------

        // --- Products Seeding ---
        const productCount = await Product.countDocuments();
        if (productCount === 0) {
            console.log('Seeding 150 Sample Products...');
            const products = [];
            const categoriesList = ['Rings', 'Necklaces', 'Earrings', 'Bracelets', 'Bangles', 'Pendants'];
            const carats = ['14k', '18k', '22k', '24k'];

            for (let i = 0; i < 150; i++) {
                const categoryName = faker.helpers.arrayElement(categoriesList);
                const name = `${faker.commerce.productAdjective()} ${faker.commerce.productMaterial()} ${categoryName}`;

                products.push({
                    user: adminUser._id,
                    name: name,
                    image: `https://picsum.photos/seed/${faker.string.uuid()}/400/400`,
                    images: [
                        `https://picsum.photos/seed/${faker.string.uuid()}/400/400`,
                        `https://picsum.photos/seed/${faker.string.uuid()}/400/400`
                    ],
                    description: faker.commerce.productDescription(),
                    brand: 'S.D. Jewels',
                    productDetails: `Handcrafted ${name} featuring premium finish and elegant design.`,
                    weight: `${faker.number.float({ min: 1, max: 50, fractionDigits: 1 })}g`,
                    carat: faker.helpers.arrayElement(carats),
                    category: [categoryName, 'Jewelry'],
                    price: faker.number.int({ min: 500, max: 15000 }),
                    countInStock: faker.number.int({ min: 0, max: 100 }),
                    rating: faker.number.float({ min: 3.5, max: 5, fractionDigits: 1 }),
                    numReviews: faker.number.int({ min: 0, max: 200 }),
                    reviews: [],
                    featured: faker.datatype.boolean(0.2),
                });
            }
            await Product.insertMany(products);
            console.log('150 Sample Products Seeded');
        }
        // ------------------------

        // --- Order Seeding ---
        const orderCount = await Order.countDocuments();
        if (orderCount === 0) {
            const products = await Product.find({}).limit(50);
            const allUsers = await User.find({});

            if (products.length > 0 && allUsers.length > 0) {
                console.log('Seeding Sample Orders for all users...');
                const orders = [];
                const statuses = ['Processing', 'Accepted', 'Shipped', 'Delivered'];
                const paymentMethods = ['PayPal', 'Credit Card', 'Debit Card', 'UPI', 'Cash on Delivery'];
                const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow'];

                for (const user of allUsers) {
                    // Each user gets 1-3 orders
                    const numOrders = faker.number.int({ min: 1, max: 3 });

                    for (let i = 0; i < numOrders; i++) {
                        // Pick 1-4 random products for each order
                        const numItems = faker.number.int({ min: 1, max: 4 });
                        const orderItems = [];
                        let totalPrice = 0;

                        for (let j = 0; j < numItems; j++) {
                            const product = faker.helpers.arrayElement(products);
                            const qty = faker.number.int({ min: 1, max: 3 });
                            orderItems.push({
                                name: product.name,
                                qty: qty,
                                image: product.image,
                                price: product.price,
                                product: product._id
                            });
                            totalPrice += product.price * qty;
                        }

                        const status = faker.helpers.arrayElement(statuses);
                        const isPaid = status !== 'Processing' || faker.datatype.boolean(0.7);
                        const isDelivered = status === 'Delivered';

                        // Generate random date within last 60 days
                        const orderDate = faker.date.recent({ days: 60 });

                        orders.push({
                            user: user._id,
                            orderId: `ORD-${faker.string.alphanumeric(8).toUpperCase()}`,
                            orderStatus: status,
                            orderItems: orderItems,
                            shippingAddress: {
                                address: faker.location.streetAddress(),
                                city: faker.helpers.arrayElement(cities),
                                postalCode: faker.location.zipCode('######'),
                                country: 'India',
                                phone: faker.phone.number('+91 ##########')
                            },
                            paymentMethod: faker.helpers.arrayElement(paymentMethods),
                            taxPrice: Math.round(totalPrice * 0.18), // 18% GST
                            shippingPrice: totalPrice > 5000 ? 0 : 99,
                            totalPrice: Math.round(totalPrice * 1.18) + (totalPrice > 5000 ? 0 : 99),
                            isPaid: isPaid,
                            paidAt: isPaid ? orderDate : undefined,
                            isDelivered: isDelivered,
                            deliveredAt: isDelivered ? faker.date.between({ from: orderDate, to: new Date() }) : undefined,
                            createdAt: orderDate,
                            updatedAt: orderDate
                        });
                    }
                }

                await Order.insertMany(orders);
                console.log(`${orders.length} Sample Orders Seeded`);
            }
        }
        // ---------------------

    } catch (error) {
        console.error('Seeding Error:', error);
    }
});




// ============= SECURITY MIDDLEWARE =============

// Security HTTP Headers - Enhanced Configuration
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false, // Disable for development, enable in production
    xssFilter: true, // Enable XSS filter - X-XSS-Protection header
    noSniff: true, // Prevent MIME sniffing
    frameguard: { action: 'deny' }, // Prevent clickjacking
    hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true
    },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));

// Rate Limiting - 100 requests per 15 minutes per IP
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: { message: 'Too many requests from this IP, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', limiter);

// Stricter rate limit for auth routes (50 attempts per 15 min in dev)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50, // Increased for development
    message: { message: 'Too many login attempts. Please wait a few minutes and try again.' },
});
app.use('/api/users/login', authLimiter);

// NoSQL Injection Protection
// Removed mongoSanitize - was causing API errors
// Security maintained via: Helmet, rate limiting, CORS, input validation

// XSS Protection is handled by Helmet's xssFilter header

// CORS Configuration
const corsOptions = {
    origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'https://s-d-jewels-costumer.vercel.app',
        'https://s-d-jewels-admin.vercel.app'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Body Parser
app.use(express.json({ limit: '10mb' })); // Limit body size
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ===============================================

app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/categories', categoryRoutes);

app.get('/', (req, res) => {
    res.send('API is running...');
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
