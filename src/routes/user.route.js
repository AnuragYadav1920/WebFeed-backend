const express = require("express");
const router = express.Router();
const { upload } = require("../middlewares/multer.middleware.js");
const userControllers = require("../controllers/user.controller.js");
const { verifyJWT } = require("../middlewares/auth.middleware.js");

router.route("/register").post(userControllers.register);
router.route("/login").post(userControllers.login);
router.route("/update-profile").patch(
  verifyJWT,
  upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'cover', maxCount: 1 }
  ]),
  userControllers.updateUserProfile
);
router
  .route("/subscribe-and-unsubscribe")
  .post(verifyJWT, userControllers.subscribeAndUnsubscribe);
router.route("/get-creator").post(userControllers.getCreator);
router.route("/creators").get(userControllers.getCreators);
router.route("/search-creators").post(userControllers.searchCreators);
router.route("/get-subscribers").post(userControllers.totalSubscribers)
router.route("/check-subscribed").post(verifyJWT, userControllers.checkSubscription)

module.exports = router;
