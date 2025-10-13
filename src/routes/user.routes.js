import express from "express";

const router = express.Router();

// Add protected user routes here in future
router.get("/", (req, res) => res.json({ message: "users stub" }));

export default router;
