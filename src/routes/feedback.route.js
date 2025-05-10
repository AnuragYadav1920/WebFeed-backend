const express = require('express')
const router = express.Router()
const {verifyJWT} = require('../middlewares/auth.middleware.js')
const feedbackControllers = require("../controllers/feedback.controller.js")

router.route("/send-message").post(verifyJWT,feedbackControllers.createFeedback)

module.exports = router