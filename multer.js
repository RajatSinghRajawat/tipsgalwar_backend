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
        const filetypes = /avif|jpeg|jpg|png|gif|webp|svg|mp4|webm|dat|xlsx|xls|csv/;

        const extname = filetypes.test(
            path.extname(file.originalname).toLowerCase(),
        );

        const mimetype =
            file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
            file.mimetype === "application/vnd.ms-excel" ||
            file.mimetype === "text/csv";

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            return cb("invalid file type", false);
        }
    },
});

module.exports = upload;