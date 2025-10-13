import jwt from "jsonwebtoken";
import config from "../config/index.js";
import { createError } from "../utils/AppError.js";
import logger from "../utils/logger.js";
import User from "../models/user.modal.js";

async function loadUserById(userId) {
  const user = await User.findById(userId);
  if (!user) throw createError.unauthorized("User not found");
  return user;
}

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;
    if (!token) throw createError.unauthorized("No token provided");

    const decoded = jwt.verify(token, config.jwt.secret);
    if (!decoded?.id) throw createError.unauthorized("Invalid token");

    req.user = await loadUserById(decoded.id);
    return next();
  } catch (err) {
    logger.error(err);
    return next(err);
  }
};


