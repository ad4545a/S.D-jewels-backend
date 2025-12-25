const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { faker } = require('@faker-js/faker');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Category = require('./models/Category');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const categoriesList = ['Rings', 'Necklaces', 'Earrings', 'Bracelets', 'Bangles', 'Pendants'];

const generateCategoryData = () => {
    return categoriesList.map(cat => ({
        name: cat,
        description: `Beautiful collection of ${cat}`
    }));
};

// Generate sample users
const generateUsersData = (numUsers = 55) => {
    const users = [];
    const avatarStyles = ['adventurer', 'avataaars', 'big-ears', 'bottts', 'croodles', 'fun-emoji', 'lorelei', 'micah', 'miniavs', 'open-peeps', 'personas', 'pixel-art'];

    for (let i = 0; i < numUsers; i++) {
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        const name = `${firstName} ${lastName}`;
        const email = faker.internet.email({ firstName, lastName }).toLowerCase();
        const avatarStyle = faker.helpers.arrayElement(avatarStyles);

        users.push({
            name: name,
            email: email,
            // Pre-hashed password for '123456' - using bcrypt hash
            password: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
            avatar: `https://api.dicebear.com/7.x/${avatarStyle}/svg?seed=${firstName}${lastName}`,
            role: 'user',
        });
    }

    return users;
};

// Helper to get realistic jewelry images from Unsplash source
const getJewelryImage = (category, index) => {
    // Used curated keywords to get relevant images
    const keywords = {
        'Rings': 'diamond ring, gold ring, engagement ring',
        'Necklaces': 'gold necklace, diamond necklace, pendant',
        'Earrings': 'gold earrings, diamond studs, jewelry',
        'Bracelets': 'gold bracelet, diamond bracelet, jewelry',
        'Bangles': 'indian bangles, gold bangles, jewelry',
        'Pendants': 'gold pendant, diamond pendant, necklace'
    };

    // Use source.unsplash.com with specific keywords and a random sig to avoid caching duplicates
    return `https://source.unsplash.com/400x400/?${keywords[category] || 'jewelry'}&sig=${index}`;
};

const generateJewelryData = (numEntries = 150, userId) => {
    const products = [];
    const carats = ['14k', '18k', '22k', '24k'];
    const materials = ['Gold', 'Diamond', 'Silver', 'Platinum', 'Rose Gold'];
    const adjectives = ['Elegant', 'Exquisite', 'Classic', 'Modern', 'Vintage', 'Luxury', 'Handcrafted', 'Sparkling'];

    for (let i = 0; i < numEntries; i++) {
        const category = faker.helpers.arrayElement(categoriesList);
        const material = faker.helpers.arrayElement(materials);
        const adjective = faker.helpers.arrayElement(adjectives);

        const name = `${adjective} ${material} ${category}`; // e.g., "Elegant Gold Ring"

        products.push({
            user: userId,
            name: name,
            image: getJewelryImage(category, i),
            images: [
                getJewelryImage(category, i + 1000),
                getJewelryImage(category, i + 2000)
            ],
            description: `Experience the luxury of this ${name}. Crafted with precision and care, this piece features authentic ${material} and a timeless design suitable for any occasion.`,
            brand: 'S.D. Jewels',
            productDetails: `Material: ${material}\nCategory: ${category}\nFinish: High Polish\nCertified: Yes`,
            weight: `${faker.number.float({ min: 2, max: 20, fractionDigits: 1 })}g`,
            carat: material.includes('Gold') ? faker.helpers.arrayElement(carats) : undefined,
            category: [category, 'Jewelry', material],
            price: faker.number.int({ min: 5000, max: 250000 }), // More realistic prices for jewelry
            countInStock: faker.number.int({ min: 1, max: 50 }),
            rating: faker.number.float({ min: 4.0, max: 5, fractionDigits: 1 }), // Good ratings for demo
            numReviews: faker.number.int({ min: 5, max: 100 }),
            reviews: [],
            featured: faker.datatype.boolean(0.1), // 10% featured
        });
    }

    return products;
};

const importData = async () => {
    try {
        await Order.deleteMany();
        await Product.deleteMany();
        await Category.deleteMany();
        await User.deleteMany();

        // Base users (admin + demo user)
        const baseUsers = [
            {
                name: 'Admin User',
                email: 'admin@example.com',
                password: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', // hashed '123456'
                role: 'admin'
            },
            {
                name: 'John Doe',
                email: 'john@example.com',
                password: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', // hashed '123456'
            }
        ];

        // Generate 55 sample users
        const generatedUsers = generateUsersData(55);

        // Combine all users
        const allUsers = [...baseUsers, ...generatedUsers];

        const createdUsers = await User.insertMany(allUsers);
        console.log(`${createdUsers.length} Users Imported!`);

        const adminUser = createdUsers[0]._id;

        // Seed Categories
        const sampleCategories = generateCategoryData();
        await Category.insertMany(sampleCategories);
        console.log('Categories Imported!');

        // Seed Products
        const sampleProducts = generateJewelryData(150, adminUser);
        await Product.insertMany(sampleProducts);
        console.log('Products Imported!');

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await Order.deleteMany();
        await Product.deleteMany();
        await Category.deleteMany();
        await User.deleteMany();

        console.log('Data Destroyed!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}
