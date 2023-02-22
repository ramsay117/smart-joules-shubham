import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { redisConnection } from "../db/redis.js";

const prisma = new PrismaClient();

async function isUser(req, res, next) {
  const { username, password } = req.body;

  const user = await prisma.user.findUnique({
    where: {
      username: username,
    },
  });
  if (!user) {
    return res.status(400).json({ message: "incorrect username" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "incorrect password" });
  }
  next();
}

async function addUser(req, res, next) {
  const { name, username, password } = req.body;

  const user = await prisma.user.findUnique({
    where: {
      username: username,
    },
  });
  if (user) {
    return res.status(400).json({ message: "User already exists" });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = await prisma.user.create({
    data: {
      name,
      username,
      password: hashedPassword,
    },
  });
  next();
}

function createToken(req, res, next) {
  const username = req.body.username;
  const payload = { username };
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "10m",
  });
  req.username = username;
  req.accessToken = accessToken;
  next();
}

async function verifyToken(req, res, next) {
  const { username } = req.params;
  const tokenHeader = req.headers.authorization;
  const token = tokenHeader && tokenHeader.split(" ")[1];
  if (!token) res.sendStatus(401);

  await redisConnection.get(username, (err, reply) => {
    if (err) return res.sendStatus(500);
    if (reply == null) return res.sendStatus(403);
  });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403);
    req.username = decoded.username;
    req.accessToken = token;
  });
  next();
}

export { isUser, addUser, createToken, verifyToken };
