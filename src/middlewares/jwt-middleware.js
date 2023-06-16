const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;

function decodeToken(token) {
  return jwt.decode(token.replace("Bearer ", ""));
}
const expiresIn = "365d";
function getJWTToken(data) {
  const token = `Bearer ${jwt.sign(data, jwtSecret, { expiresIn })}`;
  return token;
}

module.exports = { decodeToken, getJWTToken };
