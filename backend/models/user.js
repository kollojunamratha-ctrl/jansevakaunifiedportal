const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, unique: true, index: true, trim: true },
    password: { type: String, required: true },
    name: { type: String, default: "", trim: true },
    age: { type: Number, default: null },
    state: { type: String, default: "", trim: true },
    address: { type: String, default: "", trim: true },
    aadhar: { type: String, default: "", trim: true },
    schemesApplied: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
  },
  {
    versionKey: false
  }
);

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
