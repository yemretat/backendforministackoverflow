const user = require("../../models/User");
const sendJwtToClient = (user, res) => {
  //Generate JWT , userModeline göre jwt oluştur.

  const token = user.generateJwtFromUser();

  const { JWT_COOKIE, NODE_ENV } = process.env;
  // developmentdaysa secure değerini false,productiondaysa true yapıcaz

  // key access_token , cookie'nin expiresini ver.
  return res
    .status(200)
    .cookie("access_token", token, {
      httpOnly: true,
      expires: new Date(Date.now() + parseInt(JWT_COOKIE) * 1000 * 60),
      secure: NODE_ENV === "development" ? false : true,
    })
    .json({
      success: true,
      access_token: token,
      data: {
        name: user.name,
        email: user.email,
      },
    });
  //Response dönder!
};
const isTokenIncluded = (req) => {
  return (
    req.headers.authorization && req.headers.authorization.startsWith("Bearer:")
  );
};
// tokenValue'yu Bearerdan ayırmak !
const getAccessTokenFromHeader = (req) => {
  const authorization = req.headers.authorization;
  const access_token = authorization.split(" ")[1];
  return access_token;
};

module.exports = { getAccessTokenFromHeader, sendJwtToClient, isTokenIncluded };
