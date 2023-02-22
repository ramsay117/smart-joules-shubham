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
  req.userId = newUser.id;
  next();
}

function createToken(req, res, next) {
  const { username } = req.body;
  const payload = { username };
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "10m",
  });
  req.username = username;
  req.accessToken = accessToken;
  next();
}

async function storeToken(req, res, next) {
  const { username, accessToken } = req;
  await redisConnection.set(
    username,
    JSON.stringify({ accessToken }),
    (err) => {
      if (err) return res.sendStatus(500);
    }
  );
  next();
}

async function deleteToken(req, res, next) {
  const {
    user: { username },
  } = req;
  redisConnection.del(username, (err, reply) => {
    if (err) return res.sendStatus(500);
  });
  next();
}

async function verifyToken(req, res, next) {
  const {
    user: { username },
  } = req;

  const tokenHeader = req.headers.authorization;
  const token = tokenHeader && tokenHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);

  const reply = await redisConnection.get(username);
  if (reply == null) return res.status(403).send("login required");

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403);
    req.username = decoded.username;
    req.accessToken = token;
  });
  next();
}

async function findUserById(req, res, next) {
  const { userId } = req.params;
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  if (!user) return res.status(400).send("No user found");
  req.user = user;
  next();
}

export {
  isUser,
  addUser,
  createToken,
  storeToken,
  verifyToken,
  findUserById,
  deleteToken,
};
