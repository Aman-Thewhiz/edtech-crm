import { Router } from "express";
import * as attendanceController from "../controllers/attendanceController.js";

const router = Router();


router.post("/", attendanceController.markAttendance);

router.post("/bulk", attendanceController.bulkMarkAttendance);

router.get("/", attendanceController.getAttendance);

router.get("/stats/summary", attendanceController.getAttendanceStats);

router.get("/:entityType/:entityId", attendanceController.getAttendanceByEntity);

router.get("/summary/:entityType/:entityId", attendanceController.getAttendanceSummary);

router.put("/:id", attendanceController.updateAttendance);

router.delete("/:id", attendanceController.deleteAttendance);

// Holiday endpoints
router.post("/holidays/create", attendanceController.createHoliday);

router.get("/holidays/list", attendanceController.getHolidays);

router.get("/holidays/:id", attendanceController.getHoliday);

router.put("/holidays/:id", attendanceController.updateHoliday);

router.delete("/holidays/:id", attendanceController.deleteHoliday);

export default router;
