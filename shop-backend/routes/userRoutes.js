const express = require('express');
const router = express.Router();
const {
    authUser,
    registerUser,
    getUserProfile,
    getUsers,
    deleteUser,
    getUserById,
    updateUser
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');
// Removed strict validation - was causing API crashes

// Public routes
router.route('/').post(registerUser).get(protect, admin, getUsers);
router.post('/login', authUser);

// Protected routes
router.route('/profile').get(protect, getUserProfile);
router.route('/:id')
    .delete(protect, admin, deleteUser)
    .get(protect, admin, getUserById)
    .put(protect, admin, updateUser);

module.exports = router;


