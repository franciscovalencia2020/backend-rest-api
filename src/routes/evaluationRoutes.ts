import { Router } from 'express';
import { controller as EvaluationController } from '@controllers/evaluationController';
import { asyncHandler } from '@utils/utils';
import { authMiddleware } from '@middlewares/authMiddleware';
import validateRequest from '@middlewares/validateRequest';
import { createEvaluationValidator, updateEvaluationValidator, validateEvaluationId, submitEvaluationValidator, answerScoreValidator } from '@validators/evaluationValidator';
import { authorizeRoles } from '@middlewares/roleMiddleware';

const router = Router();

router.post('/evaluations', authMiddleware, authorizeRoles(['admin']), createEvaluationValidator, validateRequest, EvaluationController.createEvaluation.bind(EvaluationController));
router.get('/evaluations', authMiddleware, authorizeRoles(['admin', 'manager', 'empleado']), asyncHandler(EvaluationController.getAllEvaluations));
router.get('/evaluations/:id', authMiddleware, authorizeRoles(['admin', 'manager', 'empleado']), validateEvaluationId, validateRequest, asyncHandler(EvaluationController.getEvaluationById));
router.put('/evaluations/:id', authMiddleware, authorizeRoles(['admin']), validateEvaluationId, updateEvaluationValidator, validateRequest, EvaluationController.updateEvaluation.bind(EvaluationController));
router.post('/evaluations/:id/submit', authMiddleware, authorizeRoles(['admin', 'manager', 'empleado']), validateEvaluationId, submitEvaluationValidator, validateRequest, EvaluationController.submitEvaluation.bind(EvaluationController));
router.put('/evaluations/:id/evaluate', authMiddleware, authorizeRoles(['admin', 'manager']), validateEvaluationId, answerScoreValidator, validateRequest, EvaluationController.evaluateEvaluation.bind(EvaluationController));

export default router;
