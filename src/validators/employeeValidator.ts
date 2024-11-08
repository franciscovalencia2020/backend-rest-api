import { check, ValidationChain, param } from 'express-validator';

const commonEmployeeFields = (): ValidationChain[] => [
    check('position').isString().notEmpty().withMessage('La posición es obligatoria'),
    check('department').isString().notEmpty().withMessage('El departamento es obligatorio'),
    check('salary').isNumeric().withMessage('El salario debe ser un número'),
    check('skills').isArray().withMessage('Las habilidades deben ser una lista de strings'),
];

export const employeeValidator: ValidationChain[] = [
    check('userId').isMongoId().withMessage('El ID de usuario es inválido'),
    ...commonEmployeeFields(),
];

export const updateEmployeeValidator: ValidationChain[] = [
    ...commonEmployeeFields(),
];

export const validateEmployeeId = [
    param('id')
        .isMongoId()
        .withMessage('El ID proporcionado no es válido'),
];