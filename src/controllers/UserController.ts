import { Request, Response } from 'express';
import AppDataSource from '../config/database';
import { User } from '../entities/User';

export class UserController {
  /**
   * Get user by ID
   * GET /api/v1/users/:id
   */
  static async getUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userRepository = AppDataSource.getRepository(User);

      const user = await userRepository.findOne({
        where: { id },
        select: ['id', 'email', 'userType', 'fullName', 'profileDescription', 'companyName', 'phoneNumber', 'createdAt', 'updatedAt']
      });

      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      res.json(user);
    } catch (error) {
      console.error('Error getting user:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Update user profile
   * PUT /api/v1/users/:id
   */
  static async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;

      // Authorization: user can only update their own profile
      if (userId !== id) {
        res.status(403).json({ message: 'Forbidden: You can only update your own profile' });
        return;
      }

      const { profileDescription, fullName, companyName, phoneNumber } = req.body;

      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({ where: { id } });

      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      // Update fields if provided
      if (profileDescription !== undefined) user.profileDescription = profileDescription;
      if (fullName !== undefined) user.fullName = fullName;
      if (companyName !== undefined) user.companyName = companyName;
      if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;

      const updatedUser = await userRepository.save(user);

      res.json({
        id: updatedUser.id,
        email: updatedUser.email,
        userType: updatedUser.userType,
        fullName: updatedUser.fullName,
        profileDescription: updatedUser.profileDescription,
        companyName: updatedUser.companyName,
        phoneNumber: updatedUser.phoneNumber,
        updatedAt: updatedUser.updatedAt
      });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}
