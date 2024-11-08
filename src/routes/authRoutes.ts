import { Router } from 'express';
import { controller as AuthController } from '@controllers/authController';
import { asyncHandler } from '@utils/utils';
import { registerValidator, loginValidator } from '@validators/authValidators';
import validateRequest from '@middlewares/validateRequest';

const router = Router();

router.post('/register', registerValidator, validateRequest, asyncHandler(AuthController.register));
router.post('/login', loginValidator, validateRequest, asyncHandler(AuthController.login));

export default router;
