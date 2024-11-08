import { Messages } from '@utils/messages';
import { service as AuthService } from '@services/authService';
import { DecodedToken } from '@utils/utils';
import { repository as EmployeeRepository } from '@repositories/employeeRepository';

export const authMiddleware = async (req: Request & { user?: DecodedToken }, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: Messages.TOKEN_NOT_PROVIDED });
  }

  const decoded = AuthService.verifyToken(token) as DecodedToken | null;
  if (!decoded) {
    return res.status(401).json({ message: Messages.INVALID_TOKEN });
  }

  req.user = decoded;
  const existingEmployee = await EmployeeRepository.findByUserId(decoded.userId);
  if (existingEmployee) {
    req.user.employeeId = String(existingEmployee._id);
  }

  next();
};
