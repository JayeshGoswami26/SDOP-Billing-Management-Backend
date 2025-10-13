import jwt from "jsonwebtoken";
import config from "../config/index.js";
import { createError } from "../utils/AppError.js";
import User from "../models/user.modal.js";

function signToken(user) {
  return jwt.sign({ id: user._id }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
}

function buildUserResponse(user) {
  const { password, ...rest } = user.toObject({ virtuals: true });
  return rest;
}

export async function registerUser(data, file) {
  const { name, lastName, phoneNumber, password, email } = data;

  if (!name || !lastName || !email || !password) {
    throw createError.badRequest("name, lastName, email, and password are required");
  }

  const exists = await User.findOne({ email: email.trim().toLowerCase() });
  if (exists) {
    throw createError.conflict("Email is already registered");
  }

  const user = await User.create({
    name,
    lastName,
    phoneNumber,
    email,
    password,
  });

  const token = signToken(user);
  const userSafe = buildUserResponse(user);

  return { user: userSafe, token };
}

export async function loginUser({ email, password }) {
  if (!email || !password) {
    throw createError.badRequest("Email and password are required");
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() })
    .select("+password");

  if (!user) {
    throw createError.notFound("Account with that email was not found");
  }

  const isMatch = typeof user.comparePassword === "function"
    ? await user.comparePassword(password)
    : false;
  if (!isMatch) {
    throw createError.badRequest("Password is incorrect");
  }

  const token = signToken(user);
  const userSafe = buildUserResponse(user);

  return { user: userSafe, token };
}


