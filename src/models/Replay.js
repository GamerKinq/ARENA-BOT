const mongoose = require("mongoose");

module.exports = mongoose.model("Replay", new mongoose.Schema({
  players: [String],
  actions: [String],
  date: { type: Date, default: Date.now }
}));