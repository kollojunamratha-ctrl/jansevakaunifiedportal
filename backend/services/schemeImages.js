const SVG_DIMENSIONS = {
  width: 800,
  height: 480
};

function getSchemeImageUrl(scheme) {
  return `/api/schemes/${encodeURIComponent(scheme.id)}/image.svg`;
}

function getImagePalette(seed) {
  const normalized = (seed || "JanSevak").toLowerCase();

  if (normalized.includes("health")) {
    return {
      background: "#0f172a",
      accent: "#fb7185",
      accentSoft: "#7f1d1d"
    };
  }

  if (normalized.includes("education")) {
    return {
      background: "#111827",
      accent: "#f59e0b",
      accentSoft: "#78350f"
    };
  }

  if (normalized.includes("agriculture")) {
    return {
      background: "#052e16",
      accent: "#4ade80",
      accentSoft: "#166534"
    };
  }

  if (normalized.includes("women")) {
    return {
      background: "#3f0729",
      accent: "#f472b6",
      accentSoft: "#831843"
    };
  }

  return {
    background: "#0f172a",
    accent: "#60a5fa",
    accentSoft: "#1d4ed8"
  };
}

function escapeXml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function createSchemeImageSvg(scheme) {
  const palette = getImagePalette(scheme.category);
  const title = escapeXml(scheme.name);
  const state = escapeXml(scheme.state === "All" ? "Central Government" : scheme.state);
  const category = escapeXml(scheme.category);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${SVG_DIMENSIONS.width}" height="${SVG_DIMENSIONS.height}" viewBox="0 0 ${SVG_DIMENSIONS.width} ${SVG_DIMENSIONS.height}" role="img" aria-labelledby="title desc">
  <title id="title">${title}</title>
  <desc id="desc">${category} scheme for ${state}</desc>
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${palette.background}" />
      <stop offset="100%" stop-color="${palette.accentSoft}" />
    </linearGradient>
  </defs>
  <rect width="${SVG_DIMENSIONS.width}" height="${SVG_DIMENSIONS.height}" rx="40" fill="url(#bg)" />
  <circle cx="690" cy="110" r="124" fill="${palette.accent}" opacity="0.18" />
  <circle cx="124" cy="394" r="138" fill="#ffffff" opacity="0.07" />
  <rect x="48" y="48" width="158" height="42" rx="21" fill="#ffffff" opacity="0.12" />
  <text x="68" y="75" font-family="Segoe UI, Arial, sans-serif" font-size="20" font-weight="700" fill="#f8fafc">JanSevak</text>
  <text x="48" y="160" font-family="Segoe UI, Arial, sans-serif" font-size="26" font-weight="700" fill="${palette.accent}">${state}</text>
  <text x="48" y="214" font-family="Segoe UI, Arial, sans-serif" font-size="44" font-weight="800" fill="#ffffff">${title.slice(0, 56)}</text>
  <text x="48" y="276" font-family="Segoe UI, Arial, sans-serif" font-size="24" font-weight="500" fill="#cbd5e1">${category}</text>
  <rect x="48" y="332" width="214" height="54" rx="27" fill="#ffffff" opacity="0.1" />
  <text x="80" y="367" font-family="Segoe UI, Arial, sans-serif" font-size="24" font-weight="600" fill="#ffffff">Government Scheme</text>
</svg>`;
}

module.exports = {
  createSchemeImageSvg,
  getSchemeImageUrl
};
