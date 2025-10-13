import express from "express";
import * as controller from "../controllers/bill.controller.js";

const router = express.Router();

router.post("/", controller.createBillController);
router.get("/", controller.getAllBillsController);
router.get("/customer/:customerId", controller.getBillsByCustomerController);
router.get("/:id", controller.getBillByIdController);
router.put("/:id", controller.updateBillController);
router.patch("/:id/payment", controller.updateBillPaymentStatusController);
router.delete("/:id", controller.deleteBillController);

export default router;
