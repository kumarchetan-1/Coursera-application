const mongoose = require("mongoose")
const { Schema, ObjectId }  = mongoose

mongoose.connect(process.env.MONGODB_CONNECTION_STRING)
.then(()=> console.log("Database connected"))
.catch(e => console.log(e.message))

const UserSchema = new Schema({
    name: String,
    email: { type: String, unique: true, required: true},
    password: { type: String, required: true },
}, { timestamps: true })

const AdminSchema = new Schema({
    name: String,
    email: { type: String, unique: true, required: true},
    password: { type: String, required: true },
}, { timestamps: true })

const CourseSchema = new Schema({
    title: String,
    description: String, 
    price: Number,
    imgUrl: String,
    creatorId: { type: ObjectId, ref: "admin"}
}, { timestamps: true })

const PurchaseSchema = new Schema({
    userId: {type: ObjectId, ref: "user"},
    courseId: { type: ObjectId, ref: "course"},
}, { timestamps: true })

const userModel = mongoose.model("user", UserSchema)
const adminModel = mongoose.model("admin", AdminSchema)
const courseModel = mongoose.model("course", CourseSchema)
const purchaseModel = mongoose.model("purchase", PurchaseSchema)

module.exports = {
    userModel, adminModel, courseModel, purchaseModel
}