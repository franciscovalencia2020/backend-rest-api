import config from '@config/config';
import jwt from 'jsonwebtoken';

export class AuthService {
  public generateToken(payload: object): string {
    return jwt.sign(payload, config.jwtSecret, { expiresIn: '24h' });
  }

  public verifyToken(token: string): object | null {
    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      return decoded as object;
    } catch (error) {
      return null;
    }
  }
}

export const service = new AuthService();
