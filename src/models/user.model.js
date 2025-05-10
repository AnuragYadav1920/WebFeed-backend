require("dotenv").config()
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    phone:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
    },
    fullName:{
        type:String
    },
    location:{
        type:String
    },
    avatar:{
        type:String
    },
    cover:{
        type:String
    },
    occupation:{
        type:String
    },
    about:{
        type: String
    }
},{timestamps:true});


userSchema.pre('save',async function(next){
    try {
        if(!this.isModified('password')){
            return next()
         }
        this.password = await bcrypt.hash(this.password, 10)
        next();
    } catch (error) {
        next(error)
    }
})

userSchema.methods.comparePassword = async function(password){
    try {
        return  await bcrypt.compare(password,this.password);
    } catch (error) {
        console.log(error)
    }
}

userSchema.methods.generateToken = async function(){
    try {
       const token = await jwt.sign({
        userId:this._id.toString(),
        email:this.email,
        username:this.username
       },process.env.TOKEN_SECRET_KEY,{expiresIn:`${process.env.TOKEN_EXPIRY_DURATION}`})

       return token;
    } catch (error) {
        console.log(error)
    }
}

const User =  mongoose.model('User', userSchema)

module.exports = User