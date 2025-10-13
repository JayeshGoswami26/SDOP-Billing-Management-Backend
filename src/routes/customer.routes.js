import express from "express";
import * as controller from "../controllers/customer.controller.js";

const router = express.Router();

router.post("/", controller.createCustomerController);
router.get("/", controller.getAllCustomersController);
router.get("/search", controller.searchCustomersController);
router.get("/phone/:phoneNumber", controller.getCustomerByPhoneController);
router.get("/:id", controller.getCustomerByIdController);
router.put("/:id", controller.updateCustomerController);
router.patch("/:id/name", controller.updateCustomerNameController);
router.delete("/:id", controller.deleteCustomerController);

export default router;
