const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/Uploads");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + " " + file.originalname);
    },
});

const upload = multer({
    storage: storage,

    fileFilter: (req, file, cb) => {
        const allowedExtensions = /avif|jpeg|jpg|png|gif|webp|svg|mp4|webm|dat|xlsx|xls|csv/;
        const allowedMimeTypes = [
            'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'image/avif',
            'video/mp4', 'video/webm',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'text/csv'
        ];

        const extName = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
        const mimeType = allowedMimeTypes.includes(file.mimetype);

        if (mimeType && extName) {
            return cb(null, true);
        } else {
            return cb(new Error("invalid file type"), false);
        }
    },
});

module.exports = upload;