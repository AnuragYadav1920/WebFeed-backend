const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const User = require("../models/user.model.js");
const Subscription = require("../models/subscription.model.js");
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
      password,
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
      .json({
        msg: "Logged in Successfully",
        user: existedUser,
        token: await existedUser.generateToken(),
      });
  } catch (error) {
    return res.status(500).json({ msg: "Internal server error" });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const fetchedData = req.body;
    const files = req.files;
    const { userId } = req.user;

    if (!userId) {
      return res.status(401).json({ msg: "Unauthorized request" });
    }

    let updateData = {};

    // Handle non-file fields (e.g., fullName, password)
    if (fetchedData && Object.keys(fetchedData).length > 0) {
      const userUpdateField = Object.keys(fetchedData)[0];
      const userUpdateData = fetchedData[userUpdateField];

      if (userUpdateField === "password") {
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(userUpdateData, salt);
      } else {
        updateData[userUpdateField] = userUpdateData;
      }
    }

    // Handle file fields (avatar or cover)
    if (files && Object.keys(files).length > 0) {
      const fileKey = Object.keys(files)[0];
      const fileArray = files[fileKey];

      if (fileArray && fileArray.length > 0) {
        const uploadResult = await uploadOnCloudinary(fileArray[0].path);
        if (!uploadResult) {
          return res.status(500).json({ msg: "Failed to upload image" });
        }

        updateData[fileKey] = uploadResult.url;
      }
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.status(200).json({ msg: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error", error: error.message });
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

const getCreator = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ msg: "Invalid userId" });
    }

    const user = await User.findOne({ _id: userId }).select("-password");

    if (!user) {
      return res.status(404).json({ msg: "user not found" });
    }
    return res
      .status(200)
      .json({ msg: "user fetched successfully", user: user });
  } catch (error) {
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

const getCreators = async (req, res) => {
  try {
    const channels = await User.find().select("-password");
    if (!channels) {
      return res.status(404).json({ msg: "no channel exists" });
    }
    return res
      .status(200)
      .json({ msg: "channels fetched successfully", channels: channels });
  } catch (error) {
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

const searchCreators = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(404).json({ msg: "no channel exists" });
    }
    const creators = await User.find({ username: query });
    if (!creators) {
      return res.status(404).json({ msg: "no channel exists" });
    }
    return res
      .status(200)
      .json({ msg: "creators fetched successfully", creators: creators });
  } catch (error) {
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

const totalSubscribers = async(req, res)=>{
  try {
    const {creatorId} = req.body;
    if(!creatorId){
      return res.status(404).json({ msg: "no creator exists" });
    }
    const total = await Subscription.find({subscribedTo:creatorId});

    return res.status(200).json({total:total.length})
  } catch (error) {
    return res.status(500).json({ msg: "Internal Server Error" });
  }
}

const checkSubscription = async (req, res) => {
  try {
    const { channelId } = req.body;
    const { userId } = req.user;

    const alreadySubscribed = await Subscription.findOne({
      subscribedBy: userId,
      subscribedTo: channelId,
    });
    if(!alreadySubscribed){
      return res.status(200).json({ isSubscribed: false });
    }

    return res.status(200).json({ isSubscribed: true });
  } catch (error) {
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

module.exports = {
  register,
  login,
  updateUserProfile,
  subscribeAndUnsubscribe,
  getCreator,
  getCreators,
  searchCreators,
  totalSubscribers,
  checkSubscription
};
