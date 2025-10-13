import express from "express";
import * as controller from "../controllers/dashboard.controller.js";

const router = express.Router();

router.get("/summary", controller.getSummary);

export default router;
