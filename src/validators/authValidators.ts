import { check, ValidationChain } from 'express-validator';

export const registerValidator: ValidationChain[] = [
  check('name')
    .trim()
    .escape()
    .isString()
    .withMessage('El nombre debe ser un texto')
    .isLength({ min: 3, max: 50 })
    .withMessage('El nombre debe tener entre 3 y 50 caracteres'),
  check('email')
    .isEmail()
    .withMessage('Debe proporcionar un correo electrónico válido')
    .normalizeEmail(),
  check('password')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/[A-Z]/)
    .withMessage('La contraseña debe contener al menos una letra mayúscula')
    .matches(/[0-9]/)
    .withMessage('La contraseña debe contener al menos un número')
    .matches(/[@$!%*?&]/)
    .withMessage('La contraseña debe contener al menos un carácter especial (@, $, !, %, *, ?, &)'),
  check('role')
    .optional()
    .isIn(['admin', 'manager', 'empleado'])
    .withMessage('El rol debe ser admin, manager o empleado')
    .escape()
];

export const loginValidator: ValidationChain[] = [
  check('email')
    .isEmail()
    .withMessage('Debe proporcionar un correo electrónico válido'),
  check('password')
    .notEmpty()
    .withMessage('La contraseña es obligatoria'),
];
