
const { Router } = require("express")
const { userModel, courseModel, purchaseModel } = require("../db")
const { userMiddleware } = require("../middlewares/user")

const courseRouter = Router()

courseRouter.post("/purchase", userMiddleware,  async (req, res)=>{
  const userId = req.userId
  const courseId = req.body.courseId

  try {
    await purchaseModel.create({
        userId, courseId
    })
    res.status(200).json({
        message: "you have successfully bought the course",
        courseId
    })
  } catch (error) {
    res.status(500).json({
        message: "Internal error occured in buying the course, please try again later."
    })
  }
})

courseRouter.get("/preview", async (req, res)=>{

    try {
        const allCourses = await courseModel.find({})
        res.status(200).json({
            message: "Here are all courses",
            allCourses
        })
    } catch (error) {
        res.status(500).json({
            message: "Internal error occured in fetching the courses, please try again later."
        })
    }

})


module.exports = {
    courseRouter
}