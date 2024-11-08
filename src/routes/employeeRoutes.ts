import { Router } from 'express';
import { controller as EmployeeController } from '@controllers/employeeController';
import { validateEmployeeId, employeeValidator, updateEmployeeValidator } from '@validators/employeeValidator';
import validateRequest from '@middlewares/validateRequest';
import { asyncHandler } from '@utils/utils';
import { authMiddleware } from '@middlewares/authMiddleware';
import { authorizeRoles } from '@middlewares/roleMiddleware';

const router = Router();

router.get('/employees', authMiddleware, authorizeRoles(['admin', 'manager']), asyncHandler(EmployeeController.getAllEmployees));
router.get('/employees/:id', authMiddleware, authorizeRoles(['admin', 'manager']), validateEmployeeId, validateRequest, asyncHandler(EmployeeController.getEmployeeById));
router.post('/employees', authMiddleware, authorizeRoles(['admin']), employeeValidator, validateRequest, asyncHandler(EmployeeController.createEmployee));
router.put('/employees/:id', authMiddleware, authorizeRoles(['admin']), validateEmployeeId, updateEmployeeValidator, validateRequest, asyncHandler(EmployeeController.updateEmployee));

export default router;
