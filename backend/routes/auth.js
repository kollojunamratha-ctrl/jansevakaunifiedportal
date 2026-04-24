const express = require("express");

const {
  buildAuthResponse,
  comparePassword,
  hashPassword,
  normalizePhone,
  validatePassword,
  validatePhone
} = require("../services/auth");
const {
  createUser,
  findUserByPhone,
  updateUserPassword
} = require("../services/userRepository");

const router = express.Router();

function validateAuthPayload({ phone, password }, res) {
  const normalizedPhone = normalizePhone(phone);

  if (!validatePhone(normalizedPhone)) {
    res.status(400).json({ error: "Enter a valid 10-digit phone number." });
    return null;
  }

  if (!validatePassword(password)) {
    res.status(400).json({ error: "Password must be at least 6 characters long." });
    return null;
  }

  return {
    phone: normalizedPhone,
    password: password.trim()
  };
}

router.post("/signup", async (req, res) => {
  const payload = validateAuthPayload(req.body, res);
  if (!payload) {
    return;
  }

  try {
    const existingUser = await findUserByPhone(payload.phone);

    if (existingUser) {
      return res.status(409).json({ error: "An account with this phone number already exists." });
    }

    const user = await createUser({
      phone: payload.phone,
      password: await hashPassword(payload.password)
    });

    res.status(201).json({
      message: "Signup successful.",
      ...buildAuthResponse(user)
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to create account",
      details: error.message
    });
  }
});

router.post("/login", async (req, res) => {
  const payload = validateAuthPayload(req.body, res);
  if (!payload) {
    return;
  }

  try {
    const user = await findUserByPhone(payload.phone);

    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isPasswordValid = await comparePassword(payload.password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    res.json({
      message: "Login successful.",
      ...buildAuthResponse(user)
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to login",
      details: error.message
    });
  }
});

router.post("/forgot-password", async (req, res) => {
  const payload = validateAuthPayload(
    {
      phone: req.body.phone,
      password: req.body.newPassword
    },
    res
  );

  if (!payload) {
    return;
  }

  try {
    const user = await updateUserPassword(payload.phone, await hashPassword(payload.password));

    if (!user) {
      return res.status(404).json({ error: "No user found for this phone number." });
    }

    res.json({ message: "Password updated successfully." });
  } catch (error) {
    res.status(500).json({
      error: "Failed to reset password",
      details: error.message
    });
  }
});

module.exports = router;
