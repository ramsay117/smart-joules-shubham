import express from "express";
import { config } from "dotenv";
import router from "./auth/router.js";
import connection from "./db/prisma.js";
import { connectToRedis } from "./db/redis.js";
config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

try {
  await connection();
  await connectToRedis();
} catch (error) {
  throw new Error(error);
}

app.use("/api", router);

app.get("/", (req, res) => {
  return res.send("landing page");
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, (error) => {
  if (error) throw new Error(error);
  console.log(`server is running on port http://localhost:${PORT}`);
});
