const jwt = require("jsonwebtoken")
const { JWT_USER_SECRET  } = require("../config")

function userMiddleware(req, res, next) {
    const token = req.headers.authorization
    
    const decoded = jwt.verify(token, JWT_USER_SECRET )
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
    userMiddleware
}