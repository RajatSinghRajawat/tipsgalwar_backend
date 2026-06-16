const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    try {
        // token header se aayega
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                message: "Access denied, no token provided"
            });
        }

        // format: Bearer TOKEN
        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                message: "Invalid token format"
            });
        }

        // verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // user data request me attach
        req.user = decoded;

        next();

    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token",
            error
        });
    }
};

module.exports = authMiddleware;