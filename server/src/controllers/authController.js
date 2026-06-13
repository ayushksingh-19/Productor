const OtpRequest = require("../models/OtpRequest");
const User = require("../models/User");
const { serializeUser } = require("../utils/serializers");
const {
  createHttpError,
  isValidIdentifier,
  normalizeIdentifier,
  toDisplayName,
} = require("../utils/helpers");

async function requestOtp(req, res, next) {
  try {
    const identifier = normalizeIdentifier(req.body.identifier);

    if (!isValidIdentifier(identifier)) {
      throw createHttpError(400, "Please enter a valid email or phone number.");
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 1000 * 60 * 5);

    await User.findOneAndUpdate(
      { identifier },
      { displayName: toDisplayName(identifier), identifier },
      { new: true, setDefaultsOnInsert: true, upsert: true },
    );

    await OtpRequest.create({ code, expiresAt, identifier });

    res.json({
      demoOtp: code,
      expiresAt,
      identifier,
      message: "OTP sent successfully.",
    });
  } catch (error) {
    next(error);
  }
}

async function verifyOtp(req, res, next) {
  try {
    const identifier = normalizeIdentifier(req.body.identifier);
    const otp = String(req.body.otp || "").trim();

    if (!otp || otp.length !== 6) {
      throw createHttpError(400, "Please enter a valid OTP.");
    }

    const request = await OtpRequest.findOne({ identifier }).sort({ createdAt: -1 });

    if (!request || request.usedAt || request.expiresAt.getTime() < Date.now()) {
      throw createHttpError(400, "OTP expired. Please request a fresh code.");
    }

    if (request.code !== otp) {
      throw createHttpError(400, "Please enter a valid OTP.");
    }

    request.usedAt = new Date();
    await request.save();

    const user = await User.findOne({ identifier });

    res.json({
      message: "OTP verified successfully.",
      user: serializeUser(user),
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { requestOtp, verifyOtp };
