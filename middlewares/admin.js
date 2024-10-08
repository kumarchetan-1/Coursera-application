const jwt = require("jsonwebtoken")
const { JWT_ADMIN_SECRET } = require("../config")

function adminMiddleware(req, res, next) {
    const token = req.cookies.token

    if (!token) {
        return res.status(401).json({
            message: "No token provided!",
        });
    }

    const decoded = jwt.verify(token, JWT_ADMIN_SECRET)
    if (decoded) {
        res.userId = decoded.id
        next()
        return
    } else{
        res.status(401).json({
            message: "Invalid or expired token!"
        })
    }

}

module.exports = {
    adminMiddleware
}