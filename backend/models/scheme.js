const mongoose = require("mongoose");

const schemeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, index: true },
    state: { type: String, required: true, index: true },
    category: { type: String, required: true, index: true },
    description: { type: String, required: true },
    eligibility: { type: String, required: true },
    benefits: { type: String, required: true },
    application_process: { type: String, required: true },
    official_link: { type: String, required: true },
    image_url: { type: String, default: "" },
    source: { type: String, default: "myScheme" },
    source_slug: { type: String, required: true, index: true },
    language: { type: String, default: "en" }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Scheme || mongoose.model("Scheme", schemeSchema);
