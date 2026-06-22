import { Router, Response } from "express";
import fs from "fs";
import path from "path";
import { authenticate, authorize, AuthRequest } from "../middleware/auth";

const router = Router();

router.post("/upload", authenticate, authorize("ADMIN", "PASTOR"), (req: AuthRequest, res: Response) => {
  try {
    const { base64Data, filename } = req.body;
    if (!base64Data || !filename) {
      res.status(400).json({ message: "base64Data and filename are required" });
      return;
    }

    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      res.status(400).json({ message: "Invalid base64 data format" });
      return;
    }

    const buffer = Buffer.from(matches[2], "base64");
    const cleanFilename = filename.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const uniqueFilename = `${Date.now()}-${cleanFilename}`;
    const uploadsDir = path.join(__dirname, "../../uploads");
    const filePath = path.join(uploadsDir, uniqueFilename);

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    fs.writeFileSync(filePath, buffer);

    const url = `/uploads/${uniqueFilename}`;

    res.json({ url });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Failed to write uploaded file" });
  }
});

export default router;
