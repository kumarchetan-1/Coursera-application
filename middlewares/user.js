const jwt = require("jsonwebtoken")
const { JWT_USER_SECRET  } = require("../config")

function userMiddleware(req, res, next) {
    const token = req.cookies.token
    
    if (!token) {
        return res.status(401).json({
            message: "No token provided!",
        });
    }

    const decoded = jwt.verify(token, JWT_USER_SECRET )
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
    userMiddleware
}