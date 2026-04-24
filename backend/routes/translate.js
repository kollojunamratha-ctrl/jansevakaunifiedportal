const express = require("express");

const router = express.Router();
const translationCache = new Map();

function extractTranslatedText(payload, fallbackText) {
  if (!Array.isArray(payload) || !Array.isArray(payload[0])) {
    return fallbackText;
  }

  const translatedText = payload[0]
    .map((entry) => (Array.isArray(entry) ? entry[0] : ""))
    .filter(Boolean)
    .join("");

  return translatedText || fallbackText;
}

router.post("/translate", async (req, res) => {
  const {
    q = "",
    source = "en",
    target = "en",
    format = "text"
  } = req.body || {};

  if (!q || !target || target === source) {
    return res.json({
      translatedText: q
    });
  }

  const cacheKey = `${source}:${target}:${q}`;

  if (translationCache.has(cacheKey)) {
    return res.json({
      translatedText: translationCache.get(cacheKey),
      cached: true
    });
  }

  try {
    const params = new URLSearchParams({
      client: "gtx",
      sl: source,
      tl: target,
      dt: "t",
      q
    });

    const response = await fetch(
      `https://translate.googleapis.com/translate_a/single?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const payload = await response.json();
    const translatedText = extractTranslatedText(payload, q);

    translationCache.set(cacheKey, translatedText);

    res.json({
      translatedText
    });
  } catch (error) {
    res.status(502).json({
      error: "Translation unavailable",
      translatedText: q,
      details: error.message
    });
  }
});

module.exports = router;
