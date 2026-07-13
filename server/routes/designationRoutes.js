import { Router } from "express";
import * as designationController from "../controllers/designationController.js";

const router = Router();

router.post("/", designationController.createDesignation);

router.get("/", designationController.getDesignations);

router.get("/stats/summary", designationController.getDesignationStats);

router.get("/:id", designationController.getDesignation);

router.put("/:id", designationController.updateDesignation);

router.delete("/:id", designationController.deleteDesignation);

export default router;
