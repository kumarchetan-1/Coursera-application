const { userModel, courseModel, purchaseModel } = require("../db")
const { Router } = require("express")
const { z } = require("zod")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { JWT_USER_SECRET } = require("../config")
const { userMiddleware } = require("../middlewares/user")
const rateLimit = require("express-rate-limit")

const limiter = rateLimit({
    windowMs: 15*60*1000,
    max: 100,
    message: "Too many requests from this IP, please try again after 15 mins.",
    headers: true,
})

const userRouter = Router()

const userSchema = z.object({
    name: z.string().min(1).max(30),
    email: z.string().email().min(1).max(40),
    password: z
        .string()
        .min(8, { message: "Password should be atleast 8 characters long!" })
        .max(30)
        .regex(/[a-z]/, { message: "password must have atleast one lowercase letter" })
        .regex(/[A-Z]/, { message: "password must have atleast one uppercase letter" })
        .regex(/\d/, { message: "Password must have atleast one digit" })
        .regex(/^\S*$/, { message: "Password can't have a space" })
        .regex(/[.',{}@!$#%^*()-+=_|]/, { message: "Password must have atleast one special character from these [.',{}@!$#%^*()-+=_|]" })

})

userRouter.post("/signup", async (req, res)=>{
    const { success, data, error } = userSchema.safeParse(req.body)
    
    if (!success) {
        return res.status(400).json({
            message: "Validation failed",
            error: error.errors
        })
    }

    const { name, email, password } = req.body

    try {
        const hashedPassword = await bcrypt.hash(password, 5)
        await userModel.create({
            name, email, password: hashedPassword
        })
        res.status(200).json({
            message: "You signed up successfully"
        })
    } catch (error) {
        res.status(500).json({
            message: "An error occurred during signup. Please try again later."
        })
    }
})

userRouter.post("/signin", limiter, async (req, res)=>{
    const { email, password } = req.body

    try {
        const foundUser = await userModel.findOne({ email })

        if (!foundUser) {
            return res.status(404).json({
                message: "User doesn't exist"
            })
        }

        const isCorrectPassword = await bcrypt.compare(password, foundUser.password)

        if (!isCorrectPassword) {
            return res.status(401).json({
                message: "Incorrect credentials"
            })
        }

        const token = jwt.sign({
            id: foundUser._id
        }, JWT_USER_SECRET)

        // header based authentication
        // res.status(200).json({ token })

        // cookie based authentication 
        res.status(200).cookie("token", token, { 
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 15*24*60*60*60*1000 // valid for 15 days
         })
    } catch (error) {
        res.status(500).json({
            message: "An error occured during signin. Please try again later.",
            error: error.errors
        })
    }
})

userRouter.get("/purchases", userMiddleware, async (req, res)=>{
    const userId = req.userId
    
    try {
        const purchases = await purchaseModel.find({ userId })
        const courseIds = purchases.map(purchase=> purchase.courseId)
        const courses = await courseModel.find({
            _id: { $in: courseIds }
        })

        res.status(200).json({
            courses, purchases
        })
    } catch (error) {
        res.status(500).json({
            message: "Internal error occured!",
            error
        })
    }
 
})

module.exports = {
    userRouter
}