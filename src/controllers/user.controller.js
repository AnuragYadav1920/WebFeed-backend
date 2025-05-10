const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const User = require("../models/user.model.js");
const Subscription = require("../models/subscription.model.js")
const { uploadOnCloudinary } = require("../utils/cloudinay.js");


const register = async (req, res) => {
  try {
    const { username, email, phone, password } = req.body;
    if (!(username && email && phone && password)) {
      return res.status(400).json({ msg: "required details are missing" });
    }
    const alreadyRegistered = await User.findOne({ email: email });
    if (alreadyRegistered) {
      return res.status(200).json({ msg: "User already registered" });
    }
    const registerNewUser = await User.create({
      username,
      email,
      phone,
      password
    });
    if (!registerNewUser) {
      return res.status(400).json({ msg: "User registration failed" });
    }
    return res.status(201).json({
      msg: "user registered successfully",
      data: registerNewUser,
    });
  } catch (error) {
    return res.status(500).json({ msg: "Internal server error" });
  }
};
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!(email && password)) {
      return res.status(400).json({ msg: "Credentials are missing" });
    }
    const existedUser = await User.findOne({ email: email });
    if (!existedUser) {
      return res.status(404).json({ msg: "User not found" });
    }
    const verifyPassword = await existedUser.comparePassword(password);
    if (!verifyPassword) {
      return res.status(401).json({ msg: "Invalid Credentials" });
    }
    return res
      .status(200)
      .json({ msg: "Logged in Successfully", user: existedUser, token: await existedUser.generateToken() });
  } catch (error) {
    return res.status(500).json({ msg: "Internal server error" });
  }
};

const updateDetails = async (req, res) => {
  try {
    const updateData = req.body;
    const { userId } = req.user;
    if(!userId){
      return res.status(401).json({msg:"unauthorized request"})
    }

    const fieldToBeUpdated = Object.keys(updateData);
    if (fieldToBeUpdated.length === 0) {
      return res.status(400).json({ msg: "No fields provided for update" });
    }
    const field = fieldToBeUpdated[0];
    const updatedUser = await User.findByIdAndUpdate(
      { _id: userId },
      { $set: { [field]: updateData[field] } },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(400).json({ msg: "User not found" });
    }
    return res.status(200).json({ msg: "user updated successfully" });
  } catch (error) {
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

const updateAvatar = async (req, res) => {
  try {
    const avatarFile = req.file?.path;
    const { userId } = req.user;
    if(!userId){
      return res.status(401).json({msg:"unauthorized request"})
    }

    const uploadAvatar = await uploadOnCloudinary(avatarFile);
    if (!uploadAvatar) {
      return res.status(500).json({ msg: "Internal Server Error" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      { _id: userId },
      { $set: { ["avatar"]: uploadAvatar?.url } },
      {new:true}
    );

    if (!updatedUser) {
      return res.status(404).json({ msg: "User Not Found" });
    }

    return res.status(200).json({ msg: "avatar updated successfylly" });
  } catch (error) {
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

const updateCover = async (req, res) => {
  try {
    const coverFile = req.file?.path;
    const { userId } = req.user;
    if(!userId){
      return res.status(401).json({msg:"unauthorized request"})
    }

    const uploadCover = await uploadOnCloudinary(coverFile);
    if (!uploadCover) {
      return res.status(500).json({ msg: "Internal Server Error" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      { _id: userId },
      { $set: { ["cover"]: uploadCover?.url } },
      {new:true}
    );

    if (!updatedUser) {
      return res.status(404).json({ msg: "User Not Found" });
    }

    return res.status(200).json({ msg: "cover updated successfylly" });
  } catch (error) {
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

const subscribeAndUnsubscribe = async (req, res) => {
  try {
    const { channelId } = req.body;
    const { userId } = req.user;

    if (!userId || !channelId) {
      return res.status(401).json({ msg: "Unauthorized request" });
    }

    // Check if the subscription already exists
    const existingSubscription = await Subscription.findOne({
      subscribedBy: userId,
      subscribedTo: channelId,
    });

    if (existingSubscription) {
      // Unsubscribe
      await Subscription.findByIdAndDelete(existingSubscription._id);
      return res.status(200).json({ msg: "Channel unsubscribed successfully" });
    } else {
      // Subscribe
      const newSubscription = await Subscription.create({
        subscribedBy: userId,
        subscribedTo: channelId,
      });
      return res.status(201).json({ msg: "Subscribed successfully" });
    }
  } catch (error) {
    console.error("Error in subscribeAndUnsubscribe:", error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

const getCreator = async(req,res)=>{
  try {
    const {userId} = req.body;
    if(!userId){
      return res.status(400).json({msg:"Invalid userId"})
    }

    const user = await User.findOne({_id:userId}).select("-password");

    if(!user){
      return res.status(404).json({msg:"user not found"})
    }
    return res.status(200).json({msg:"user fetched successfully", user:user})
  } catch (error) {
    return res.status(500).json({msg:"Internal Server Error"})
  }
}


module.exports = { register, login, updateDetails, updateCover, updateAvatar , subscribeAndUnsubscribe, getCreator};
