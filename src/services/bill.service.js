import { createError } from "../utils/AppError.js";
import Bill from "../models/bill.modal.js";
import Customer from "../models/customer.modal.js";

export async function createBill(data) {
  const {
    customerId,
    customerName,
    customerPhone,
    jewelryType,
    billType = 'white',
    products,
    cgstRate = 0,
    sgstRate = 0,
    paymentMethod,
  } = data;

  if (!products || !Array.isArray(products) || products.length === 0) {
    throw createError.badRequest("Products are required");
  }

  const determinedJewelryType = jewelryType || products[0]?.productType || 'gold';
  
  if (!["silver", "gold"].includes(determinedJewelryType)) {
    throw createError.badRequest("Jewelry type must be either 'silver' or 'gold'");
  }

  if (!["green", "white"].includes(billType)) {
    throw createError.badRequest("Bill type must be either 'green' or 'white'");
  }

  let customer;
  
  if (customerId) {
    customer = await Customer.findById(customerId);
    if (!customer) {
      throw createError.notFound("Customer not found");
    }
  } else {
    if (!customerName || !customerPhone) {
      throw createError.badRequest("Customer name and phone are required when customer ID is not provided");
    }
    
    customer = await Customer.findOne({ phoneNumber: customerPhone });
    if (!customer) {
      customer = await Customer.create({
        name: customerName,
        phoneNumber: customerPhone,
      });
    }
  }

  let subtotal = 0;
  const processedProducts = products.map((product) => {
    if (!product.productName || !product.price) {
      throw createError.badRequest("Product name and price are required for each product");
    }
    
    const quantity = product.quantity || 1;
    const productSubtotal = product.price * quantity;
    subtotal += productSubtotal;

    return {
      productName: product.productName.trim(),
      price: product.price,
      quantity,
      weight: product.weight || "0.0grm",
      subtotal: productSubtotal,
    };
  });

  const finalCgstRate = billType === 'white' ? cgstRate : 0;
  const finalSgstRate = billType === 'white' ? sgstRate : 0;
  const cgstAmount = (subtotal * finalCgstRate) / 100;
  const sgstAmount = (subtotal * finalSgstRate) / 100;
  const totalGstAmount = cgstAmount + sgstAmount;
  const totalAmount = billType === 'green' ? subtotal : subtotal + totalGstAmount;

  const bill = await Bill.create({
    customer: customer._id,
    jewelryType: determinedJewelryType,
    billType,
    products: processedProducts,
    subtotal,
    cgstRate: finalCgstRate,
    sgstRate: finalSgstRate,
    cgstAmount,
    sgstAmount,
    totalGstAmount,
    totalAmount,
    paymentMethod,
  });

  await bill.populate("customer", "name phoneNumber email");

  return bill;
}

export async function getBillById(billId) {
  const bill = await Bill.findById(billId).populate("customer", "name phoneNumber email address");
  if (!bill) {
    throw createError.notFound("Bill not found");
  }
  return bill;
}

export async function getAllBills(page = 1, limit = 10, search = "", customerId = null) {
  const skip = (page - 1) * limit;
  
  let query = { isActive: true };
  
  if (customerId) {
    query.customer = customerId;
  }
  
  if (search) {
    query.$or = [
      { billNumber: { $regex: search, $options: "i" } },
      { jewelryType: { $regex: search, $options: "i" } },
    ];
  }

  const bills = await Bill.find(query)
    .populate("customer", "name phoneNumber email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Bill.countDocuments(query);

  return {
    bills,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalBills: total,
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    },
  };
}

export async function getBillsByCustomer(customerId, page = 1, limit = 10) {
  const customer = await Customer.findById(customerId);
  if (!customer) {
    throw createError.notFound("Customer not found");
  }

  return await getAllBills(page, limit, "", customerId);
}

export async function updateBill(billId, data) {
  const {
    jewelryType,
    products,
    cgstRate,
    sgstRate,
    paymentStatus,
    paymentMethod,
    notes,
  } = data;

  const bill = await Bill.findById(billId);
  if (!bill) {
    throw createError.notFound("Bill not found");
  }

  const updateData = {};
  
  if (jewelryType && ["silver", "gold"].includes(jewelryType)) {
    updateData.jewelryType = jewelryType;
  }
  
  if (products && Array.isArray(products) && products.length > 0) {
    let subtotal = 0;
    const processedProducts = products.map((product) => {
      if (!product.productName || !product.price) {
        throw createError.badRequest("Product name and price are required for each product");
      }
      
      const quantity = product.quantity || 1;
      const productSubtotal = product.price * quantity;
      subtotal += productSubtotal;

      return {
        productName: product.productName.trim(),
        price: product.price,
        quantity,
        weight: product.weight || "0.0grm",
        subtotal: productSubtotal,
      };
    });
    
    updateData.products = processedProducts;
    updateData.subtotal = subtotal;
  }
  
  if (cgstRate !== undefined) updateData.cgstRate = cgstRate;
  if (sgstRate !== undefined) updateData.sgstRate = sgstRate;
  if (paymentStatus && ["pending", "paid", "partial"].includes(paymentStatus)) {
    updateData.paymentStatus = paymentStatus;
  }
  if (paymentMethod && ["cash", "card", "upi", "bank_transfer"].includes(paymentMethod)) {
    updateData.paymentMethod = paymentMethod;
  }
  if (notes !== undefined) updateData.notes = notes?.trim();

  const updatedBill = await Bill.findByIdAndUpdate(
    billId,
    updateData,
    { new: true, runValidators: true }
  ).populate("customer", "name phoneNumber email");

  return updatedBill;
}

export async function updateBillPaymentStatus(billId, paymentStatus, paymentMethod = null) {
  if (!["pending", "paid", "partial"].includes(paymentStatus)) {
    throw createError.badRequest("Invalid payment status");
  }

  const bill = await Bill.findById(billId);
  if (!bill) {
    throw createError.notFound("Bill not found");
  }

  const updateData = { paymentStatus };
  if (paymentMethod && ["cash", "card", "upi", "bank_transfer"].includes(paymentMethod)) {
    updateData.paymentMethod = paymentMethod;
  }

  const updatedBill = await Bill.findByIdAndUpdate(
    billId,
    updateData,
    { new: true, runValidators: true }
  ).populate("customer", "name phoneNumber email");

  return updatedBill;
}

export async function deleteBill(billId) {
  const bill = await Bill.findById(billId);
  if (!bill) {
    throw createError.notFound("Bill not found");
  }

  await Bill.findByIdAndUpdate(billId, { isActive: false });
  return { message: "Bill deleted successfully" };
}
