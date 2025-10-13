import mongoose from "mongoose";

const BillSchema = new mongoose.Schema(
  {
    billNumber: {
      type: String,
      unique: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    jewelryType: {
      type: String,
      required: true,
      enum: ["silver", "gold"],
    },
    billType: {
      type: String,
      required: true,
      enum: ["green", "white"],
      default: "white",
    },
    products: [
      {
        productName: {
          type: String,
          required: true,
          trim: true,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
        quantity: {
          type: Number,
          default: 1,
          min: 1,
        },
        weight: {
          type: String,
          required: true,
          min: '0.1',
        },
        subtotal: {
          type: Number,
          required: true,
        },
      },
    ],
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    cgstRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    sgstRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    cgstAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    sgstAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalGstAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "partial"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "upi", "bank_transfer"],
    },
    notes: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

BillSchema.pre("save", async function (next) {
  if (this.isNew && !this.billNumber) {
    let billNumber;
    let isUnique = false;
    
    while (!isUnique) {
      const now = new Date();
      const year = now.getFullYear().toString().slice(-2);
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const day = now.getDate().toString().padStart(2, '0');
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      billNumber = `BILL-${year}${month}${day}-${random}`;
      
      const existingBill = await this.constructor.findOne({ billNumber });
      if (!existingBill) {
        isUnique = true;
      }
    }
    
    this.billNumber = billNumber;
  }
  
  this.cgstAmount = (this.subtotal * this.cgstRate) / 100;
  this.sgstAmount = (this.subtotal * this.sgstRate) / 100;
  this.totalGstAmount = this.cgstAmount + this.sgstAmount;
  
  if (this.billType === 'green') {
    this.totalAmount = this.subtotal;
  } else {
    this.totalAmount = this.subtotal + this.totalGstAmount;
  }
  
  next();
});

export default mongoose.model("Bill", BillSchema);
