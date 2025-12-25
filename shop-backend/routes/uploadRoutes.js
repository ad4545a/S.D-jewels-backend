const express = require('express');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

const router = express.Router();

// Configure Multer to use memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Upload stream to Cloudinary
        console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME); // DEBUG
        console.log('API Key:', process.env.CLOUDINARY_API_KEY); // DEBUG

        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'sd_jewels_products',
            },
            (error, result) => {
                if (error) {
                    console.error(error);
                    return res.status(500).json({ message: 'Cloudinary upload failed' });
                }
                res.status(200).json({
                    url: result.secure_url,
                    public_id: result.public_id
                });
            }
        );

        streamifier.createReadStream(req.file.buffer).pipe(uploadStream);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during upload' });
    }
});

module.exports = router;
