const express = require('express')
const router = express.Router()
const {verifyJWT} = require('../middlewares/auth.middleware.js')
const contactControllers = require("../controllers/contact.controller.js")

router.route("/send-message").post(verifyJWT,contactControllers.createContact)

module.exports = router