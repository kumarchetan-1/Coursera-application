const jwt = require("jsonwebtoken")
const { JWT_ADMIN_SECRET } = require("../config")

function adminMiddleware(req, res, next) {
    const token = req.headers.authorization
    
    const decoded = jwt.verify(token, JWT_ADMIN_SECRET)
    if (decoded) {
        res.userId = decoded.id
        next()
        return
    } else{
        res.send(401).json({
            message: "Session expired!"
        })
    }

}

module.exports = {
    adminMiddleware
}