import { Router } from "express";
import * as employeeController from "../controllers/employeeController.js";

const router = Router();

router.post("/", employeeController.createEmployee);

router.get("/", employeeController.getEmployees);

router.get("/stats/summary", employeeController.getEmployeeStats);

router.get("/:id", employeeController.getEmployee);

router.put("/:id", employeeController.updateEmployee);

router.patch("/:id/status", employeeController.updateEmployeeStatus);

router.patch("/:id/checklist", employeeController.updateOnboardingChecklist);

router.post("/:id/documents", employeeController.uploadEmployeeDocument);

router.delete("/:id", employeeController.deleteEmployee);

export default router;
