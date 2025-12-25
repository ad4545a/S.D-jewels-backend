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

const generateJewelryData = (numEntries = 150, userId) => {
    const products = [];
    const carats = ['14k', '18k', '22k', '24k'];

    for (let i = 0; i < numEntries; i++) {
        const category = faker.helpers.arrayElement(categoriesList);
        const name = `${faker.commerce.productAdjective()} ${faker.commerce.productMaterial()} ${category}`;

        products.push({
            user: userId,
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
            category: [category, 'Jewelry'],
            price: faker.number.int({ min: 500, max: 15000 }),
            countInStock: faker.number.int({ min: 0, max: 100 }),
            rating: faker.number.float({ min: 3.5, max: 5, fractionDigits: 1 }),
            numReviews: faker.number.int({ min: 0, max: 200 }),
            reviews: [],
            featured: faker.datatype.boolean(0.2), // 20% chance of being featured
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
