import { check, param, ValidationChain } from 'express-validator';

const commonEvaluationFields = (): ValidationChain[] => [
    check('period').optional().isString().withMessage('El período debe ser una cadena de texto'),
    check('type').optional().isString().withMessage('El tipo de evaluación debe ser una cadena de texto'),
];

export const createEvaluationValidator: ValidationChain[] = [
    check('employeeId').isMongoId().withMessage('El ID del empleado no es válido'),
    check('reviewerId').isMongoId().withMessage('El ID del evaluador no es válido'),
    ...commonEvaluationFields(),
];

export const updateEvaluationValidator: ValidationChain[] = [
    ...commonEvaluationFields(),
    check('status').optional().isIn(['pending', 'completed', 'in-progress']).withMessage('El estado de la evaluación debe ser "pending", "completed" o "in-progress"'),
];

export const validateEvaluationId = [
    param('id')
        .isMongoId()
        .withMessage('El ID de la evaluación no es válido'),
];

export const submitEvaluationValidator: ValidationChain[] = [
    check('answers').isArray().withMessage('Las respuestas deben ser un arreglo de objetos'),
    check('answers.*.questionId').isMongoId().withMessage('El ID de la pregunta no es válido'),
    check('answers.*.answerText').isString().notEmpty().withMessage('El texto de la respuesta no puede estar vacío'),
];

export const answerScoreValidator: ValidationChain[] = [
    check('answers').isArray().withMessage('Las respuestas deben ser un array'),
    check('answers.*.questionId').isMongoId().withMessage('El ID de la pregunta no es válido'),
    check('answers.*.score').isNumeric().withMessage('El puntaje debe ser un número')
];