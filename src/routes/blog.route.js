const express = require('express')
const router = express.Router()
const {upload}= require("../middlewares/multer.middleware.js")
const blogControllers = require('../controllers/blog.controller.js')
const {verifyJWT} = require('../middlewares/auth.middleware.js')

router.route("/create-post").post(verifyJWT,upload.single('postImage'),blogControllers.createPost)
router.route("/update-post-details").put(verifyJWT,upload.single('postImage'),blogControllers.updatePostDetails)
router.route("/delete-post").delete(verifyJWT,blogControllers.deletePost)
router.route("/like-and-dislike").post(verifyJWT, blogControllers.likeAndDislike)
router.route("/get-singlepost").post(blogControllers.getPostById)
router.route("/get-all-posts").get(blogControllers.getAllPosts)
router.route("/get-creator-posts").post(blogControllers.getCreatorPosts)


module.exports = router
