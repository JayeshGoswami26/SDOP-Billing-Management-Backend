import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse, sendCreated, StatusCodes } from "../utils/response.js";
import {
  createCustomer,
  getCustomerById,
  getCustomerByPhone,
  getAllCustomers,
  updateCustomer,
  updateCustomerName,
  deleteCustomer,
} from "../services/customer.service.js";

export const createCustomerController = asyncHandler(async (req, res) => {
  const customer = await createCustomer(req.body);
  return sendCreated(res, customer, "Customer created successfully");
});

export const getCustomerByIdController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const customer = await getCustomerById(id);
  return sendResponse(res, {
    status: StatusCodes.OK,
    message: "Customer retrieved successfully",
    data: customer,
  });
});

export const getCustomerByPhoneController = asyncHandler(async (req, res) => {
  const { phoneNumber } = req.params;
  const customer = await getCustomerByPhone(phoneNumber);
  return sendResponse(res, {
    status: StatusCodes.OK,
    message: "Customer retrieved successfully",
    data: customer,
  });
});

export const getAllCustomersController = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.query;
  const result = await getAllCustomers(
    parseInt(page),
    parseInt(limit),
    search
  );
  return sendResponse(res, {
    status: StatusCodes.OK,
    message: "Customers retrieved successfully",
    data: result,
  });
});

export const searchCustomersController = asyncHandler(async (req, res) => {
  const { search = "" } = req.query;
  const result = await getAllCustomers(1, 10, search);
  return sendResponse(res, {
    status: StatusCodes.OK,
    message: "Customers searched successfully",
    data: result.customers,
  });
});

export const updateCustomerController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const customer = await updateCustomer(id, req.body);
  return sendResponse(res, {
    status: StatusCodes.OK,
    message: "Customer updated successfully",
    data: customer,
  });
});

export const updateCustomerNameController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const customer = await updateCustomerName(id, name);
  return sendResponse(res, {
    status: StatusCodes.OK,
    message: "Customer name updated successfully",
    data: customer,
  });
});

export const deleteCustomerController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await deleteCustomer(id);
  return sendResponse(res, {
    status: StatusCodes.OK,
    message: result.message,
    data: null,
  });
});
