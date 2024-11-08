import { Router } from 'express';
import { reportController } from '@controllers/reportController';
import { authMiddleware } from '@middlewares/authMiddleware';
import { authorizeRoles } from '@middlewares/roleMiddleware';
import { asyncHandler } from '@utils/utils';
import { validateReportByEmployee, validateReportByDepartment } from '@validators/reportValidator';
import validateRequest from '@middlewares/validateRequest';

const router = Router();

router.get('/reports/employee/:id', authMiddleware, authorizeRoles(['admin', 'manager']), validateReportByEmployee, validateRequest, asyncHandler(reportController.getReportByEmployee));
router.get('/reports/department/:department', authMiddleware, authorizeRoles(['admin', 'manager']), validateReportByDepartment, validateRequest, asyncHandler(reportController.getReportByDepartment));

export default router;
