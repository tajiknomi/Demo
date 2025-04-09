require("dotenv").config();

const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET; // Your JWT secret
const verifyToken = (req, res, next) => { 
  const token = req.cookies.jwtToken || req.headers["authorization"]?.split(" ")[1]; // Extract token from cookies or Authorization header
  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
    req.user = decoded; // Store the decoded token in `req.user`
    next(); // Proceed to the next middleware or route handler
  });
};

module.exports = { verifyToken };