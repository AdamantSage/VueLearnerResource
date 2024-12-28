
//multer
const multer = require('multer');
const path = require('path');

// Set the file storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/multer/'); // Specify the correct upload directory
  },
  filename: (req, file, cb) => {
    // Generate a shorter, unique file name using a timestamp and the original file extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Ensure unique filenames
  }
});

// Set the file upload limits
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB size limit, adjust as needed
});

module.exports = upload; // Export the multer configuration

//multer