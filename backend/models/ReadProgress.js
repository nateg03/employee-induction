const mongoose = require("mongoose");

const ReadProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  readDocuments: Object, // Stores read status for each document
  lastUpdated: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ReadProgress", ReadProgressSchema);
