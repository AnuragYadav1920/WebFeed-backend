const express = require('express')
const router = express.Router()
const {upload}= require("../middlewares/multer.middleware.js")
const userControllers = require('../controllers/user.controller.js')
const {verifyJWT} = require('../middlewares/auth.middleware.js')


router.route("/register").post(userControllers.register)
router.route("/login").post(userControllers.login)
router.route("/update-details").patch(verifyJWT,userControllers.updateDetails)
router.route("/update-avatar").patch(upload.single('avatar'),userControllers.updateAvatar)
router.route("/update-cover").patch(upload.single('cover'),userControllers.updateCover)
router.route("/subscribe-and-unsubscribe").post(verifyJWT,userControllers.subscribeAndUnsubscribe)
router.route("/get-creator").post(userControllers.getCreator)

module.exports = router