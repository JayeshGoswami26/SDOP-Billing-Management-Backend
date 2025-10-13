import express from "express";
import userRoutes from "./user.routes.js";
import customerRoutes from "./customer.routes.js";
import billRoutes from "./bill.routes.js";
import dashboardRoutes from "./dashboard.routes.js";

const router = express.Router();

router.use("/users", userRoutes);
router.use("/customers", customerRoutes);
router.use("/bills", billRoutes);
router.use("/dashboard", dashboardRoutes);

export default router;
