const mongoose  = require('mongoose')

const feedbackSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    }
},{timestamps:true})

const Feedback = mongoose.model('Feedback', feedbackSchema)

module.exports = Feedback