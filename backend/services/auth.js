const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const PHONE_PATTERN = /^[6-9]\d{9}$/;
const PASSWORD_MIN_LENGTH = 6;
const TOKEN_EXPIRY = "7d";

function normalizePhone(phone) {
  const digitsOnly = String(phone || "").replace(/\D/g, "");

  if (digitsOnly.length === 12 && digitsOnly.startsWith("91")) {
    return digitsOnly.slice(2);
  }

  return digitsOnly;
}

function validatePhone(phone) {
  return PHONE_PATTERN.test(phone);
}

function validatePassword(password) {
  return typeof password === "string" && password.trim().length >= PASSWORD_MIN_LENGTH;
}

function getJwtSecret() {
  return process.env.JWT_SECRET || "jansevak-development-secret";
}

async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

async function comparePassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

function createAuthToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      phone: user.phone
    },
    getJwtSecret(),
    {
      expiresIn: TOKEN_EXPIRY
    }
  );
}

function verifyAuthToken(token) {
  return jwt.verify(token, getJwtSecret());
}

function buildAuthResponse(user) {
  return {
    token: createAuthToken(user),
    user: {
      id: user._id.toString(),
      phone: user.phone,
      createdAt: user.createdAt
    }
  };
}

module.exports = {
  buildAuthResponse,
  comparePassword,
  hashPassword,
  normalizePhone,
  verifyAuthToken,
  validatePassword,
  validatePhone
};
