import { createError } from "../utils/AppError.js";
import Customer from "../models/customer.modal.js";

export async function createCustomer(data) {
  const { name, phoneNumber, email, address, city, state, pincode } = data;

  if (!name || !phoneNumber) {
    throw createError.badRequest("Name and phone number are required");
  }

  const existingCustomer = await Customer.findOne({ phoneNumber: phoneNumber.trim() });
  if (existingCustomer) {
    throw createError.conflict("Customer with this phone number already exists");
  }

  const customer = await Customer.create({
    name: name.trim(),
    phoneNumber: phoneNumber.trim(),
    email: email?.trim().toLowerCase(),
    address: address?.trim(),
    city: city?.trim(),
    state: state?.trim(),
    pincode: pincode?.trim(),
  });

  return customer;
}

export async function getCustomerById(customerId) {
  const customer = await Customer.findById(customerId);
  if (!customer) {
    throw createError.notFound("Customer not found");
  }
  return customer;
}

export async function getCustomerByPhone(phoneNumber) {
  const customer = await Customer.findOne({ phoneNumber: phoneNumber.trim() });
  if (!customer) {
    throw createError.notFound("Customer not found");
  }
  return customer;
}

export async function getAllCustomers(page = 1, limit = 10, search = "") {
  const skip = (page - 1) * limit;
  
  let query = { isActive: true };
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { phoneNumber: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const customers = await Customer.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Customer.countDocuments(query);

  return {
    customers,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalCustomers: total,
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    },
  };
}

export async function updateCustomer(customerId, data) {
  const { name, email, address, city, state, pincode } = data;

  const customer = await Customer.findById(customerId);
  if (!customer) {
    throw createError.notFound("Customer not found");
  }

  const updateData = {};
  if (name) updateData.name = name.trim();
  if (email) updateData.email = email.trim().toLowerCase();
  if (address) updateData.address = address.trim();
  if (city) updateData.city = city.trim();
  if (state) updateData.state = state.trim();
  if (pincode) updateData.pincode = pincode.trim();

  const updatedCustomer = await Customer.findByIdAndUpdate(
    customerId,
    updateData,
    { new: true, runValidators: true }
  );

  return updatedCustomer;
}

export async function updateCustomerName(customerId, name) {
  if (!name) {
    throw createError.badRequest("Name is required");
  }

  const customer = await Customer.findById(customerId);
  if (!customer) {
    throw createError.notFound("Customer not found");
  }

  const updatedCustomer = await Customer.findByIdAndUpdate(
    customerId,
    { name: name.trim() },
    { new: true, runValidators: true }
  );

  return updatedCustomer;
}

export async function deleteCustomer(customerId) {
  const customer = await Customer.findById(customerId);
  if (!customer) {
    throw createError.notFound("Customer not found");
  }

  await Customer.findByIdAndUpdate(customerId, { isActive: false });
  return { message: "Customer deleted successfully" };
}
