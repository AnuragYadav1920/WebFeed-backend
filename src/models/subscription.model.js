const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    subscribedBy: {
      type: String,
      required: true,
    },
    subscribedTo: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Subscription = mongoose.model("Subscription", subscriptionSchema);

module.exports = Subscription;
