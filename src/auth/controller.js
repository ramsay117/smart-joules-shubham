import { redisConnection } from "../db/redis.js";

async function loginController(req, res) {
  const { username, accessToken } = req;
  await redisConnection.set(
    username,
    JSON.stringify({ accessToken }),
    (err) => {
      if (err) return res.sendStatus(500);
    }
  );
  res.send({ accessToken });
}

function logoutController(req, res) {
  const { username } = req;
  redisConnection.del(username, (err, reply) => {
    if (err) return res.sendStatus(500);
  });
  res.redirect("/");
}

export { loginController, logoutController };
