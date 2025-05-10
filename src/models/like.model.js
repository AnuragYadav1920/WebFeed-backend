const mongoose  = require('mongoose')

const likeSchema = new mongoose.Schema({
    likedBy:{
        type:String,
        required:true
    },
    likedPostId:{
        type:String,
        required:true
    }
},{timestamps:true})

const Like = mongoose.model('Like', likeSchema)

module.exports = Like