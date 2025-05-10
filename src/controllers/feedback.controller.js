const Feedback = require("../models/feedback.model.js");

const createFeedback = async (req, res) => {
  try {
    const { description } = req.body;
    const { email, username, userId } = req.user;
    if (!(email && username && userId)) {
      return res.status(401).json({ msg: "unauthorized request" });
    }
    if (!description) {
      return res.status(400).json({ msg: "details are missing" });
    }

    const createMessage = await Feedback.create({
      email,
      username,
      description,
    });
    if(!createMessage){
        return res.status(404).json({msg:"failed to send the message"})
    }
    return res.status(201).json({msg:"feedback sent successfully"})
  } catch (error) {
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

module.exports = {createFeedback}