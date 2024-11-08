import { User, IUser } from '@models/user';

export class UserRepository {

  public async findByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email });
  }

  public async saveUser(userData: Partial<IUser>): Promise<IUser> {
    const user = new User(userData);
    return await user.save();
  }

  public async findById(id: string): Promise<IUser | null> {
    return await User.findById(id);
  }

  public async deleteMany(filter = {}) {
    return User.deleteMany(filter);
  }

}

export const repository = new UserRepository();
