import { Request, Response } from 'express';
import { repository as UserRepository } from '@repositories/userRepository';
import { service as AuthService } from '@services/authService';
import { service as HashingService } from '@services/hashingService';
import { Messages } from '@utils/messages';

export class AuthController {

  public async register(req: Request, res: Response): Promise<Response> {
    try {
      const { name, email, password, role } = req.body;

      const existingUser = await UserRepository.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: Messages.USER_ALREADY_EXISTS });
      }

      const hashedPassword = await HashingService.hashPassword(password);

      const user = await UserRepository.saveUser({
        name,
        email,
        password: hashedPassword,
        role
      });

      return res.status(201).json({ userId: user.id, message: Messages.USER_REGISTERED_SUCCESS });
    } catch (error) {
      throw error;
    }
  }

  public async login(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password } = req.body;

      const user = await UserRepository.findByEmail(email);
      if (!user) {
        return res.status(400).json({ message: Messages.INVALID_CREDENTIALS });
      }

      const isMatch = await HashingService.comparePassword(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: Messages.INVALID_CREDENTIALS });
      }

      const token = AuthService.generateToken({ userId: user._id, role: user.role });

      return res.status(200).json({ token });
    } catch (error) {
      throw error;
    }
  }

}

export const controller = new AuthController();