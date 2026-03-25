import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import type { Request } from "express";

const storage = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void,
  ) => {
    cb(null, "./src/public/images/uploads");
  },

  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void,
  ) => {
    const unique = uuidv4();
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

export default upload;
