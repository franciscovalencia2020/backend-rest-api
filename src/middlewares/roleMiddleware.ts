import { Request, Response, NextFunction } from 'express';
import { Messages } from '@utils/messages';

export const authorizeRoles = (allowedRoles: Array<'admin' | 'manager' | 'empleado'>) => {
  return (req: Request & { user?: { role?: string } }, res: Response, next: NextFunction) => {

    const userRole = req.user?.role as 'admin' | 'manager' | 'empleado';

    if (!userRole || !allowedRoles.includes(userRole)) {
      res.status(403).json({ message: Messages.FORBIDDEN_ACCESS });
      return;
    }
    next();
  };
};
