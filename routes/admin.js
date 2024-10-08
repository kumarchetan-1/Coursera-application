const { adminModel, courseModel } = require("../db")
const { Router } = require("express")
const { z } = require("zod")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { JWT_ADMIN_SECRET } = require("../config")
const { adminMiddleware } = require("../middlewares/admin")

const adminRouter = Router()

const userSchema = z.object({
    name: z.string().min(1).max(30),
    email: z.min(1).max(4).email(),
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

adminRouter.post("/signup", async (req, res) => {
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
        await adminModel.create({
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

adminRouter.post("/signin", async (req, res) => {
    const { email, password } = req.body

    try {
        const foundUser = await adminModel.findOne({ email })

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
        }, JWT_ADMIN_SECRET)

        res.status(200).json({ token })
    } catch (error) {
        res.status(500).json({
            message: "An error occured during signin. Please try again later.",
            error: error.errors
        })
    }
})

adminRouter.post("/course", adminMiddleware, async (req, res) => {
    const userId = req.userId
    const { title, description, price, imgUrl } = req.body

    try {
        const courseCreated = await courseModel.create({
            title,
            description,
            imgUrl,
            price,
            creatorId: userId
        })

        res.status(200).json({
            message: "Course created successsfully",
            courseId: courseCreated._id
        })
    } catch (error) {
        res.status(500).json({
            message: "Error in creating the course. Please try again later"
        })
    }
})

adminRouter.put("/course", adminMiddleware, async (req, res) => {
    const userId = req.userId
    const { title, description, price, imgUrl, courseId } = req.body

    try {
        const courseUpdated = await courseModel.updateOne(
            {
             creatorId: userId,
             courseId
            },
            {
            title,
            description,
            imgUrl,
            price
        })

        res.status(200).json({
            message: "Course updated successsfully",
            courseId: courseUpdated._id
        })
    } catch (error) {
        res.status(500).json({
            message: "Error in creating the course. Please try again later"
        })

    }
})

adminRouter.get("/course/bulk", adminMiddleware, async (req, res) => {
    const userId = req.userId

    try {
        const courses = await courseModel.find({
            creatorId: userId,
        })

        res.status(200).json({
            message: "All of your courses",
            courses
        })
    } catch (error) {
        res.status(500).json({
            message: "Internal server error occured",
            error
        })
    }
})

module.exports = {
    adminRouter
}