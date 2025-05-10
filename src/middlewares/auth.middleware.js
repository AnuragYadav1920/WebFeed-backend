require('dotenv').config()
const jwt = require('jsonwebtoken')

const verifyJWT = async(req, res, next)=>{
    try {
        const token = req.headers['authorization'].split(" ")[1]; 
        const verifyToken = jwt.verify(token,`${process.env.TOKEN_SECRET_KEY}`)
        if(!verifyToken){
            console.log(error);
            next();
        }
        req.user = verifyToken;
        next();
    } catch (error) {
        console.log(error)
    }
}

module.exports = {verifyJWT}