const mongoose = require("mongoose");
const { uploadOnCloudinary } = require("../utils/cloudinay.js");
const User = require("../models/user.model.js");
const Blog = require("../models/blog.model.js");
const Like = require("../models/like.model.js");

const createPost = async (req, res) => {
  try {
    const { title, category, description } = req.body;
    const postImagePath = req.file?.path;
    const { userId } = req.user;

    if (!(title && category && description && postImagePath)) {
      return res.status(400).json({ msg: "Details are missing" });
    }

    if (!userId) {
      return res.status(401).json({ msg: "Unauthorized request" });
    }

    const uploadImage = await uploadOnCloudinary(postImagePath);
    if (!uploadImage) {
      return res.status(500).json({ msg: "Upload to Cloudinary failed" });
    }

    const createdPost = await Blog.create({
      title,
      description,
      category,
      postImage: uploadImage?.url,
      creator: userId,
    });

    if (!createdPost) {
      return res.status(500).json({ msg: "Failed to create the post" });
    }

    await createdPost.populate("creator");

    return res
      .status(201)
      .json({ msg: "Post created successfully", post: createdPost });
  } catch (error) {
    console.error("Error creating post:", error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

const updatePostDetails = async (req, res) => {
  try {
    const { postId, title, category, description } = req.body;
    const postImageFile = req.file?.path;
    const { userId } = req.user;

    if (!userId) {
      return res.status(401).json({ msg: "Unauthorized request" });
    }

    if (!(title && category && description)) {
      return res.status(400).json({ msg: "details missing" });
    }
    let postImageUpdated = false;
    let updatedPostImageUrl = "";
    if (postImageFile) {
      const uploadPostImage = await uploadOnCloudinary(postImageFile);
      if (!uploadPostImage || !uploadPostImage.url) {
        return res.status(500).json({ msg: "Image upload failed" });
      }
      postImageUpdated = true;
      updatedPostImageUrl = uploadPostImage?.url;
    }
    const prevPost = await Blog.findById(postId);

    const updatedPost = await Blog.findByIdAndUpdate(
      postId,
      {
        $set: {
          title: title,
          category: category,
          description: description,
          postImage: postImageUpdated
            ? updatedPostImageUrl
            : prevPost.postImage,
        },
      },
      { new: true }
    );

    if (!updatedPost) {
      return res.status(404).json({ msg: "Post not found" });
    }

    return res.status(200).json({
      msg: "Post updated successfully",
      post: updatedPost,
    });
  } catch (error) {
    console.error("Update error:", error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

const deletePost = async (req, res) => {
  try {
    const { postId } = req.body;
    const { userId } = req.user;
    if (!postId) {
      return res.status(400).json({ msg: "Post ID is required" });
    }
    if (!userId) {
      return res.status(401).json({ msg: "Unauthorized request" });
    }

    await Blog.findByIdAndDelete({ _id: postId });
    const checkPostDeleted = await Blog.findById(postId);
    if (checkPostDeleted) {
      return res.status(500).json({ msg: "failed to delete the post" });
    }
    return res.status(200).json({ msg: "post deleted successfully" });
  } catch (error) {
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

const likeAndDislike = async (req, res) => {
  try {
    const { postId } = req.body;
    const { userId } = req.user;

    if (!userId || !postId) {
      return res.status(401).json({ msg: "Unauthorized request" });
    }

    // Check if the user has already liked the post
    const existingLike = await Like.findOne({
      likedBy: userId,
      likedPostId: postId,
    });

    if (existingLike) {
      // If liked, remove the like (dislike)
      await Like.findByIdAndDelete(existingLike._id);
      return res.status(200).json({ msg: "Post disliked successfully" });
    } else {
      // If not liked, create a new like
      const newLike = await Like.create({
        likedBy: userId,
        likedPostId: postId,
      });
      return res.status(201).json({ msg: "Post liked successfully" });
    }
  } catch (error) {
    console.error("Error in likeAndDislike:", error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

const getPostById = async (req, res) => {
  try {
    const { postId } = req.body;
    if (!postId) {
      return res.status(400).json({ msg: "postId is missing" });
    }
    const post = await Blog.findById(postId).populate("creator");
    if (!post) {
      return res.status(404).json({ msg: "post not found" });
    }

    return res
      .status(200)
      .json({ msg: "post fetched successfully", post: post });
  } catch (error) {
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

const getAllPosts = async (req, res) => {
  try {
    const allPosts = await Blog.find().populate("creator");
    if (!allPosts) {
      return res.status(404).json({ msg: "No posts found" });
    }
    return res.status(200).json({ msg: "All posts found", posts: allPosts });
  } catch (error) {
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

const getCreatorPosts = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(404).json({ msg: "Invalid creator" });
    }

    const posts = await Blog.find({ creator: userId }).populate("creator");

    if (!posts) {
      return res.status(404).json({ msg: "no posts found" });
    }

    return res
      .status(200)
      .json({ msg: "posts fetched successfully", posts: posts });
  } catch (error) {
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

const getCreatorDetails = async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) {
      return res.status(404).json({ msg: "Invalid creator" });
    }

    const userDetails = await User.findOne({ username: username }).select(
      "-password"
    );
    if (!userDetails) {
      return res.status(404).json({ msg: "Invalid creator" });
    }
    const creatorId = userDetails._id;
    const posts = await Blog.find({ creator: creatorId });

    if (!posts) {
      return res.status(404).json({ msg: "no posts found" });
    }

    return res.status(200).json({
      msg: "posts fetched successfully",
      posts: posts,
      creator: userDetails,
    });
  } catch (error) {
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

const totalLikes = async(req, res)=>{
  try {
    const {postId} = req.body;
    if(!postId){
      return res.status(404).json({ msg: "Invalid postId" });
    }
    const total = await Like.find({likedPostId:postId})
    return res.status(200).json({total:total.length})
  } catch (error) {
    return res.status(500).json({ msg: "Internal Server Error" });
  }
}

module.exports = {
  createPost,
  updatePostDetails,
  deletePost,
  likeAndDislike,
  getPostById,
  getAllPosts,
  getCreatorPosts,
  getCreatorDetails,
  totalLikes
};
