import { Router } from "express";

import * as invoiceController from "../controllers/invoiceController.js";

const router = Router();

router.post("/", invoiceController.createInvoice);

router.get("/", invoiceController.getInvoices);

router.get("/stats/summary", invoiceController.getInvoiceStats);

router.get(
  "/:id/pdf",
  invoiceController.downloadInvoicePdf
);

router.get("/:id", invoiceController.getInvoice);

router.put("/:id", invoiceController.updateInvoice);

router.patch(
  "/:id/status",
  invoiceController.updateInvoiceStatus
);

router.delete("/:id", invoiceController.deleteInvoice);

export default router;