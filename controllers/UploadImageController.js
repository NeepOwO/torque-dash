const path = require('path');
const fs = require('fs');

class UploadImageController {
    static async uploadImage(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            // Generate URL for the uploaded file
            const fileUrl = `/uploads/${req.file.filename}`;
            
            res.json({
                success: true,
                url: fileUrl,
                filename: req.file.filename,
                originalName: req.file.originalname,
                size: req.file.size,
                mimetype: req.file.mimetype
            });
        } catch (err) {
            console.error('Image upload error:', err);
            res.status(500).json({ error: 'Failed to upload image' });
        }
    }

    static async deleteImage(req, res) {
        try {
            const { filename } = req.params;
            const filePath = path.join(__dirname, '../public/uploads', filename);

            // Check if file exists
            if (!fs.existsSync(filePath)) {
                return res.status(404).json({ error: 'File not found' });
            }

            // Delete file
            fs.unlinkSync(filePath);

            res.json({
                success: true,
                message: 'Image deleted successfully'
            });
        } catch (err) {
            console.error('Image delete error:', err);
            res.status(500).json({ error: 'Failed to delete image' });
        }
    }

    static async listImages(req, res) {
        try {
            const uploadsDir = path.join(__dirname, '../public/uploads');

            // Create directory if it doesn't exist
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
                return res.json({ images: [] });
            }

            // Read directory
            const files = fs.readdirSync(uploadsDir);

            // Filter only image files and get stats
            const images = files
                .filter(file => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file))
                .map(file => {
                    const filePath = path.join(uploadsDir, file);
                    const stats = fs.statSync(filePath);
                    return {
                        filename: file,
                        url: `/uploads/${file}`,
                        size: stats.size,
                        created: stats.birthtime,
                        modified: stats.mtime
                    };
                })
                .sort((a, b) => b.modified - a.modified);

            res.json({ images });
        } catch (err) {
            console.error('List images error:', err);
            res.status(500).json({ error: 'Failed to list images' });
        }
    }
}

module.exports = UploadImageController;

