const jwt = require("jsonwebtoken");

const generateToken = (userId) => {
  // sign a JWT with payload (userId)
  return jwt.sign(
    { id: userId }, 
    process.env.JWT_SECRET, 
    { expiresIn: "30d" } // token valid for 30 days
  );
};

module.exports = generateToken;
