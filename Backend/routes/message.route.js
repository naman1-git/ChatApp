import express from "express";
import multer from "multer";
import { getMessage, sendMessage , reactToMessage } from "../controller/message.controller.js";
import secureRoute from "../middleware/secureRoute.js";


const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/send/:id", secureRoute, upload.single("file"), sendMessage);
router.get("/get/:id", secureRoute, getMessage);
router.post("/react", reactToMessage);

export default router;
