import { check, param, ValidationChain, body } from 'express-validator';

export const questionValidator: ValidationChain[] = [
  check('evaluationId').isMongoId().withMessage('El ID de evaluación es inválido'),
  check('content').isString().notEmpty().withMessage('El contenido de la pregunta es obligatorio'),
];

export const validateQuestionId: ValidationChain[] = [
  param('id').isMongoId().withMessage('El ID de la pregunta proporcionado no es válido'),
];

export const createQuestionsValidator: ValidationChain[] = [
  check('evaluationId')
    .isMongoId()
    .withMessage('El ID de la evaluación no es válido.'),
  body('questions')
    .isArray({ min: 1 })
    .withMessage('Debe proporcionar al menos una pregunta.')
    .custom((questions: any[]) => questions.every(q => typeof q === 'string' && q.trim().length > 0))
    .withMessage('Cada pregunta debe ser un string no vacío.')
];