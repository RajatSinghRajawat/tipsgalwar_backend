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
    const filetypes = /avif|jpeg|jpg|png|gif|webp|svg|mp4|webm|dat/;

    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase(),
    );

    const mimetype = filetypes.test(file.mimetype) 

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      return cb("invalid file type", false);
    }
  },
});

module.exports = upload;