const express = require("express");

const {
  getSchemes,
  getSchemeById,
  initializeRepository
} = require("../services/schemeRepository");
const { createSchemeImageSvg } = require("../services/schemeImages");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    await initializeRepository();

    const {
      state,
      category,
      search,
      page = "1",
      limit = "12",
      language = "en"
    } = req.query;

    const result = await getSchemes({
      state,
      category,
      search,
      page: Number(page),
      limit: Number(limit),
      language
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: "Failed to load schemes",
      details: error.message
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    await initializeRepository();
    const scheme = await getSchemeById(req.params.id);

    if (!scheme) {
      return res.status(404).json({ error: "Scheme not found" });
    }

    res.json(scheme);
  } catch (error) {
    res.status(500).json({
      error: "Failed to load scheme",
      details: error.message
    });
  }
});

router.get("/:id/image.svg", async (req, res) => {
  try {
    await initializeRepository();
    const scheme = await getSchemeById(req.params.id);

    if (!scheme) {
      return res.status(404).type("image/svg+xml").send("<svg xmlns=\"http://www.w3.org/2000/svg\" />");
    }

    res.type("image/svg+xml").send(createSchemeImageSvg(scheme));
  } catch (error) {
    res.status(500).json({
      error: "Failed to load scheme image",
      details: error.message
    });
  }
});

module.exports = router;
