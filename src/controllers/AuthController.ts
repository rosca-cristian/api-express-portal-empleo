import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import AppDataSource from '../config/database';
import { User, UserType } from '../entities/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export class AuthController {
  static async signup(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, userType } = req.body;

      // Validation
      if (!email || !password || !userType) {
        res.status(400).json({ message: 'Email, password, and user type are required' });
        return;
      }

      if (password.length < 8) {
        res.status(400).json({ message: 'Password must be at least 8 characters' });
        return;
      }

      const userRepository = AppDataSource.getRepository(User);

      // Check if user already exists
      const existingUser = await userRepository.findOne({ where: { email } });
      if (existingUser) {
        res.status(409).json({ message: '✗ Email already registered. Please log in.' });
        return;
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create user
      const user = userRepository.create({
        email,
        passwordHash,
        userType: userType as UserType,
      });

      await userRepository.save(user);

      res.status(201).json({
        success: true,
        message: '✓ Account created! Redirecting to login...',
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Validation
      if (!email || !password) {
        res.status(400).json({ message: 'Email and password are required' });
        return;
      }

      const userRepository = AppDataSource.getRepository(User);

      // Find user
      const user = await userRepository.findOne({ where: { email } });
      if (!user) {
        res.status(401).json({ message: '✗ Invalid email or password' });
        return;
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        res.status(401).json({ message: '✗ Invalid email or password' });
        return;
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          userType: user.userType,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          userType: user.userType,
          fullName: user.fullName,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}
