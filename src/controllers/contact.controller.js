const Contact = require("../models/contact.model.js");

const createContact = async (req, res) => {
  try {
    const { description } = req.body;
    const { email, username, userId } = req.user;
    if (!(email && username && userId)) {
      return res.status(401).json({ msg: "unauthorized request" });
    }
    if (!description) {
      return res.status(400).json({ msg: "details are missing" });
    }

    const createMessage = await Contact.create({
      email,
      username,
      description,
    });
    if(!createMessage){
        return res.status(404).json({msg:"failed to send the message"})
    }
    return res.status(201).json({msg:"message sent successfully"})
  } catch (error) {
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

module.exports = {createContact}
