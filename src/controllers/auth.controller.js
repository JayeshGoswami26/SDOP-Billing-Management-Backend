import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse, sendCreated, StatusCodes } from "../utils/response.js";
import { registerUser, loginUser } from "../services/auth.service.js";

export const register = asyncHandler(async (req, res) => {
  const { user, token } = await registerUser(req.body, req.file);
  return sendCreated(res, { user, token }, "User registered successfully");
});

export const login = asyncHandler(async (req, res) => {
  const { user, token } = await loginUser(req.body);
  return sendResponse(res, {
    status: StatusCodes.OK,
    message: "Login successful",
    data: { user, token },
  });
});
