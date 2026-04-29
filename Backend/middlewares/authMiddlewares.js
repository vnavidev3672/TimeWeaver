const JWT = require('jsonwebtoken');
const userModel = require('../models/userModel');

 module.exports.requireSignIn = async (req, res, next) => {
    try {
         const token = req.headers.authorization;

        if (!token) {
            return res.status(401).json({ success: false, message: "Access Denied: No Token Provided" });
        }

         const decoded = JWT.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } 
    catch (err) {
        console.error("JWT Verification Error:", err.message);
        return res.status(401).json({ success: false, message: "Invalid or Expired Token" });
    }
};

 module.exports.isAdmin = async (req, res, next) => {
    try {
        const user = await userModel.findById(req.user._id);
        if (!user || user.role !== 1) {
            return res.status(401).send({
                success: false,
                message: "UnAuthorized Access",
            });
        } else {
            next();
        }
    } 
    catch (error) {
        console.error("Admin Middleware Error:", error.message);
        res.status(401).send({
            success: false,
            error,
            message: "Error in Admin Middleware",
        });
    }
};
