import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), "src", "uploads", "documents"));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

export const uploadDocument = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["pdf", "docx", "txt", "png", "jpg", "jpeg"];

    const ext = path.extname(file.originalname).substring(1);

    if (!allowed.includes(ext)) {
      return cb(new Error("File type not allowed"));
    }

    cb(null, true);
  },
});
