import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse, sendCreated, StatusCodes } from "../utils/response.js";
import {
  createBill,
  getBillById,
  getAllBills,
  getBillsByCustomer,
  updateBill,
  updateBillPaymentStatus,
  deleteBill,
} from "../services/bill.service.js";

export const createBillController = asyncHandler(async (req, res) => {
  const bill = await createBill(req.body);
  return sendCreated(res, bill, "Bill created successfully");
});

export const getBillByIdController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const bill = await getBillById(id);
  return sendResponse(res, {
    status: StatusCodes.OK,
    message: "Bill retrieved successfully",
    data: bill,
  });
});

export const getAllBillsController = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = "", customerId } = req.query;
  const result = await getAllBills(
    parseInt(page),
    parseInt(limit),
    search,
    customerId
  );
  return sendResponse(res, {
    status: StatusCodes.OK,
    message: "Bills retrieved successfully",
    data: result,
  });
});

export const getBillsByCustomerController = asyncHandler(async (req, res) => {
  const { customerId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const result = await getBillsByCustomer(
    customerId,
    parseInt(page),
    parseInt(limit)
  );
  return sendResponse(res, {
    status: StatusCodes.OK,
    message: "Customer bills retrieved successfully",
    data: result,
  });
});

export const updateBillController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const bill = await updateBill(id, req.body);
  return sendResponse(res, {
    status: StatusCodes.OK,
    message: "Bill updated successfully",
    data: bill,
  });
});

export const updateBillPaymentStatusController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { paymentStatus, paymentMethod } = req.body;
  const bill = await updateBillPaymentStatus(id, paymentStatus, paymentMethod);
  return sendResponse(res, {
    status: StatusCodes.OK,
    message: "Bill payment status updated successfully",
    data: bill,
  });
});

export const deleteBillController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await deleteBill(id);
  return sendResponse(res, {
    status: StatusCodes.OK,
    message: result.message,
    data: null,
  });
});
