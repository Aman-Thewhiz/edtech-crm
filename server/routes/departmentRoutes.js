import { Router } from "express";
import * as departmentController from "../controllers/departmentController.js";

const router = Router();

router.post("/", departmentController.createDepartment);

router.get("/", departmentController.getDepartments);

router.get("/stats/summary", departmentController.getDepartmentStats);

router.get("/:id", departmentController.getDepartment);

router.put("/:id", departmentController.updateDepartment);

router.delete("/:id", departmentController.deleteDepartment);

export default router;
