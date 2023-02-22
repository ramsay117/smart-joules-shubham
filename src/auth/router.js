import { Router } from "express";
import {
  detailsController,
  loginController,
  logoutController,
} from "./controller.js";
import {
  addUser,
  createToken,
  deleteToken,
  findUserById,
  isUser,
  storeToken,
  verifyToken,
} from "./middlewares.js";

const router = Router();

router.post(
  "/user/signup",
  [addUser, createToken, storeToken],
  loginController
);

router.post("/user/login", [isUser, createToken, storeToken], loginController);

router.get("/user/:userId", [findUserById, verifyToken], detailsController);

router.get(
  "/user/logout/:userId",
  [findUserById, deleteToken],
  logoutController
);

export default router;
