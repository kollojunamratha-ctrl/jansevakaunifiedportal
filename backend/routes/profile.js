const express = require("express");

const { normalizePhone, validatePhone, verifyAuthToken } = require("../services/auth");
const { findUserById, updateUserProfile } = require("../services/userRepository");

const router = express.Router();

function getTokenFromRequest(req) {
  const authHeader = req.get("authorization") || "";

  if (!authHeader.startsWith("Bearer ")) {
    return "";
  }

  return authHeader.slice("Bearer ".length).trim();
}

async function requireProfileUser(req, res, next) {
  const token = getTokenFromRequest(req);

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const payload = verifyAuthToken(token);
    const user = await findUserById(payload.sub);

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    req.profileUser = user;
    next();
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

function serializeProfile(user) {
  return {
    id: user._id?.toString?.() || user.id,
    phone: user.phone || "",
    name: user.name || "",
    age: user.age ?? null,
    state: user.state || "",
    address: user.address || "",
    aadhar: user.aadhar || "",
    schemesApplied: user.schemesApplied ?? 0,
    createdAt: user.createdAt || null
  };
}

function sanitizeProfilePayload(body) {
  const payload = {};

  if (Object.prototype.hasOwnProperty.call(body, "phone")) {
    payload.phone = normalizePhone(body.phone);
  }

  if (Object.prototype.hasOwnProperty.call(body, "name")) {
    payload.name = String(body.name || "").trim();
  }

  if (Object.prototype.hasOwnProperty.call(body, "age")) {
    payload.age = body.age === "" || body.age == null ? null : Number(body.age);
  }

  if (Object.prototype.hasOwnProperty.call(body, "state")) {
    payload.state = String(body.state || "").trim();
  }

  if (Object.prototype.hasOwnProperty.call(body, "address")) {
    payload.address = String(body.address || "").trim();
  }

  if (Object.prototype.hasOwnProperty.call(body, "aadhar")) {
    payload.aadhar = String(body.aadhar || "").replace(/\s+/g, "").trim();
  }

  if (Object.prototype.hasOwnProperty.call(body, "schemesApplied")) {
    payload.schemesApplied =
      body.schemesApplied === "" || body.schemesApplied == null ? 0 : Number(body.schemesApplied);
  }

  return payload;
}

router.get("/profile", requireProfileUser, async (req, res) => {
  res.json({
    profile: serializeProfile(req.profileUser)
  });
});

router.post("/profile", requireProfileUser, async (req, res) => {
  const updates = sanitizeProfilePayload(req.body || {});

  if (
    Object.prototype.hasOwnProperty.call(updates, "phone") &&
    !validatePhone(updates.phone)
  ) {
    return res.status(400).json({ error: "Enter a valid 10-digit phone number." });
  }

  if (
    Object.prototype.hasOwnProperty.call(updates, "age") &&
    updates.age != null &&
    (!Number.isFinite(updates.age) || updates.age < 0 || updates.age > 120)
  ) {
    return res.status(400).json({ error: "Enter a valid age." });
  }

  if (
    Object.prototype.hasOwnProperty.call(updates, "schemesApplied") &&
    (!Number.isFinite(updates.schemesApplied) || updates.schemesApplied < 0)
  ) {
    return res.status(400).json({ error: "Enter a valid schemes applied count." });
  }

  if (updates.aadhar && !/^\d{12}$/.test(updates.aadhar)) {
    return res.status(400).json({ error: "Enter a valid 12-digit Aadhar number." });
  }

  try {
    const user = await updateUserProfile(req.profileUser._id?.toString?.() || req.profileUser.id, updates);

    if (!user) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.json({
      message: "Profile updated successfully.",
      profile: serializeProfile(user)
    });
  } catch (error) {
    if (error.code === "DUPLICATE_PHONE") {
      return res.status(409).json({ error: error.message });
    }

    res.status(500).json({
      error: "Failed to update profile",
      details: error.message
    });
  }
});

module.exports = router;
