const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {

    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({
            message: "Access token is required"
        });
    }

    const actualToken = token.split(" ")[1];

    try {

        const decoded = jwt.verify(actualToken, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {

        return res.status(401).json({
            message: "Invalid or expired token"
        });

    }

};
module.exports = authMiddleware;