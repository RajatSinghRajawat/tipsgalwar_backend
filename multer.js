const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadsDir = path.join(__dirname, "public", "Uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const safeName = path
      .basename(file.originalname)
      .replace(/[\/\\?%*:|"<>]/g, "-")
      .trim()
      .replace(/\s+/g, "_");

    cb(null, `${Date.now()}-${safeName}`);
  },
});

const upload = multer({
  storage: storage,

  fileFilter: (req, file, cb) => {
    const filetypes = /\.(avif|jpeg|jpg|png|gif|webp|mp4|webm|xlsx|xls|csv)$/i;
    const mimetypes = /^(image|video)\//;

    const extname = filetypes.test(file.originalname.toLowerCase());
    const mimetype =
      mimetypes.test(file.mimetype) ||
      file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.mimetype === "application/vnd.ms-excel" ||
      file.mimetype === "text/csv";

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      return cb(new Error("Only images, videos, and Excel/CSV files are allowed!"), false);
    }
  },
});

module.exports = upload;