import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse, StatusCodes } from "../utils/response.js";
import { getDashboardSummary } from "../services/dashboard.service.js";

export const getSummary = asyncHandler(async (req, res) => {
  const summary = await getDashboardSummary();
  return sendResponse(res, {
    status: StatusCodes.OK,
    message: "Dashboard summary fetched",
    data: summary,
  });
});
