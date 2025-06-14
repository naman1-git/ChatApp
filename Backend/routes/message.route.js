import express from "express";
import multer from "multer";
import { getMessage, sendMessage , reactToMessage, getScheduledMessages } from "../controller/message.controller.js";
import secureRoute from "../middleware/secureRoute.js";
import { scheduleMessage } from "../controller/message.controller.js";
import { cancelScheduledMessage } from "../controller/message.controller.js";


const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/send/:id", secureRoute, upload.single("file"), sendMessage);
router.get("/get/:id", secureRoute, getMessage);
router.post("/react", reactToMessage);
router.post("/schedule", secureRoute, scheduleMessage);
router.delete("/cancel/:messageId", secureRoute, cancelScheduledMessage);
router.get("/scheduled", secureRoute, getScheduledMessages);

export default router;
