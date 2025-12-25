const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const countProducts = async () => {
    try {
        const count = await Product.countDocuments();
        console.log(`Current Product Count: ${count}`);
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

countProducts();
