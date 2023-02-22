import redis from "redis";
export let redisConnection = null;
export async function connectToRedis() {
  const redisClient = redis.createClient({ url: "redis://127.0.0.1:6379" });

  redisClient.on("connect", () => {
    console.log("Redis connected");
    redisConnection = redisClient;
  });

  redisClient.on("error", (error) => {
    console.error("Redis connection error--", error);
  });
  await redisClient.connect();
}
