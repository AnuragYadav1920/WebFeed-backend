const mongoose  = require('mongoose')

const contactSchema = new mongoose.Schema({
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

const Contact = mongoose.model('Contact', contactSchema)

module.exports = Contact