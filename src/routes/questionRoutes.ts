import { Router } from 'express';
import { controller as QuestionController } from '@controllers/questionController';
import { questionValidator, validateQuestionId, createQuestionsValidator } from '@validators/questionValidator';
import validateRequest from '@middlewares/validateRequest';
import { asyncHandler } from '@utils/utils';
import { authorizeRoles } from '@middlewares/roleMiddleware';
import { authMiddleware } from '@middlewares/authMiddleware';

const router = Router();

router.post('/questions', authMiddleware, authorizeRoles(['admin']), createQuestionsValidator, validateRequest, asyncHandler(QuestionController.createQuestions));
router.get('/questions', authMiddleware, authorizeRoles(['admin', 'manager']), asyncHandler(QuestionController.getAllQuestions));
router.put('/questions/:id', authMiddleware, authorizeRoles(['admin']), validateQuestionId, questionValidator, validateRequest, asyncHandler(QuestionController.updateQuestion));

export default router;
