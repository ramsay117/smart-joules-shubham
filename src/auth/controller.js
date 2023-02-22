function loginController(req, res) {
  const { userId, accessToken } = req;
  return res.send({ userId, accessToken });
}

async function detailsController(req, res) {
  const {
    user: { name, username },
  } = req;

  return res.json({ name, username });
}

function logoutController(req, res) {
  return res.redirect("/");
}

export { loginController, detailsController, logoutController };
