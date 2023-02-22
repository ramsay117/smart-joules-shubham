import { Router } from "express";
import { loginController, logoutController } from "./controller.js";
import { addUser, createToken, isUser, verifyToken } from "./middlewares.js";

const router = Router();

router.post("/user/signup", [addUser, createToken], loginController);
router.post("/user/login", [isUser, createToken], loginController);

router.get("/user/logout/:username", [verifyToken], logoutController);

export default router;
