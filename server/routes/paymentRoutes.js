import { Router } from "express";
import * as paymentController from "../controllers/paymentController.js";

const router = Router();

router.post("/", paymentController.createPayment);

router.get("/", paymentController.getPayments);

router.get("/stats/summary", paymentController.getPaymentStats);

router.get("/:id", paymentController.getPayment);

router.put("/:id", paymentController.updatePayment);

router.patch("/:id/reverse", paymentController.reversePayment);

router.delete("/:id", paymentController.deletePayment);

export default router;
