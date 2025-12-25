const express = require('express');
const router = express.Router();
const {
    createCategory,
    getCategories,
    deleteCategory,
} = require('../controllers/categoryController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').post(protect, admin, createCategory).get(getCategories);
router.route('/:id').delete(protect, admin, deleteCategory);

module.exports = router;
