require('dotenv').config()
const { v2:cloudinary } = require('cloudinary');
const fs = require('fs')

cloudinary.config({ 
    cloud_name: `${process.env.CLOUD_NAME}`, 
    api_key: `${process.env.CLOUDINARY_API_KEY}`, 
    api_secret: `${process.env.CLOUDINARY_API_SECRET }`
});

const uploadOnCloudinary = async(fileLocalPath)=>{
    try {
        if(!fileLocalPath) return null;
        const response = await cloudinary.uploader
        .upload(
          fileLocalPath,{resource_type:"auto"}
        )
        fs.unlinkSync(fileLocalPath)
        return response;
    } catch (error) {
        fs.unlinkSync(fileLocalPath)
        console.log("uploading failed on cloudinary", error)
        return null;
    }
    
}

module.exports = {uploadOnCloudinary}

