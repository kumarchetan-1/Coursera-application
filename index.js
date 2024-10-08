require("dotenv").config()
const express = require("express")
const { adminRouter } = require("./routes/admin")
const { userRouter } = require("./routes/user")
const { courseRouter } = require("./routes/course")

const PORT = process.env.PORT
const app = express()

app.use(express.json())

app.use("/api/v1/admin", adminRouter)
app.use("/api/v1/user", userRouter)
app.use("/api/v1/course", courseRouter)


app.listen(PORT, ()=> console.log(`Listening on PORT: ${PORT}`))