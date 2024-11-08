import { param } from 'express-validator';

export const validateReportByEmployee = [
    param('id')
        .isMongoId()
        .withMessage('Invalid employee ID format.'),
];

export const validateReportByDepartment = [
    param('department')
        .isString()
        .withMessage('Department must be a string.')
        .notEmpty()
        .withMessage('Department cannot be empty.'),
];
