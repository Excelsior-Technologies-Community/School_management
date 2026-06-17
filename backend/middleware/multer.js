const multer = require('multer');
const fs = require('fs');

// Enforce a simple, tangible local upload location
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, uploadDir); // This guarantees req.file.path exists!
    },
    filename: function (req, file, callback) {
        callback(null, Date.now() + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'application/pdf' ||
        file.mimetype.startsWith('image/') ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
        cb(null, true);
    } else {
        cb(new Error('Unsupported file type. Please upload a PDF, Image, or DOCX asset.'), false);
    }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;