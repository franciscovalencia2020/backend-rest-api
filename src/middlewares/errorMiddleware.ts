import { Request, Response, NextFunction } from 'express';

const errorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction): void => {

  console.error(err.stack);
  const statusCode = 500;
  const message = err.message || 'Error interno del servidor';
  res.status(statusCode).json({
    success: false,
    message,
    statusCode
  });

}

export default errorMiddleware;
