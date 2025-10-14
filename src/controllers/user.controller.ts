import { Request, Response } from 'express';
import User, { IUser, ROLES } from '../models/user.model';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt.utils';


export const registerUser = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        status: false,
        message: 'Missing required fields (firstName, lastName, email, password)',
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: false,
        message: 'User already exists',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      first_name: firstName,
      last_name: lastName,
      email,
      password: hashedPassword,
      role: ROLES.includes(role) ? role : 'user',
    });

    await user.save();

    const token = generateToken(user);

    return res.status(201).json({
      status: true,
      message: 'User registered successfully',
      data: {
        id: user._id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.role,
      },
      token,
    });

  } catch (error) {
    console.error('Register Error:', error);
    return res.status(500).json({
      status: false,
      message: 'Internal Server Error',
    });
  }
};


export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        status: false,
        message: 'Missing required fields (email, password)',
      });
    }

    const existingUser = await User.findOne({ email }).select('+password');
    if (!existingUser) {
      return res.status(400).json({
        status: false,
        message: 'User does not exist',
      });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        status: false,
        message: 'Invalid credentials',
      });
    }

    // Generate token
    const token = generateToken(existingUser);

    return res.status(200).json({
      status: true,
      message: 'User logged in successfully',
      data: {
        id: existingUser._id,
        firstName: existingUser.first_name,
        lastName: existingUser.last_name,
        email: existingUser.email,
        role: existingUser.role,
      },
      token,
    });

  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({
      status: false,
      message: 'Internal Server Error',
    });
  }
};


export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password -__v');

    if (!user) {
      return res.status(404).json({
        status: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      status: true,
      message: 'User found successfully',
      data: user,
    });

  } catch (error) {
    console.error('GetUser Error:', error);
    return res.status(500).json({
      status: false,
      message: 'Internal Server Error',
    });
  }
};


export const getAllUsers = async (_req: Request, res: Response) => {
  try {
    const users = await User.find().select('-password -__v');
    return res.status(200).json({
      status: true,
      message: 'Users fetched successfully',
      data: users,
    });
  } catch (error) {
    console.error('GetAllUsers Error:', error);
    return res.status(500).json({
      status: false,
      message: 'Internal Server Error',
    });
  }
};


export const updateUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, role } = req.body;

    if (!id) {
      return res.status(400).json({
        status: false,
        message: 'User ID is required',
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        first_name: firstName,
        last_name: lastName,
        email,
        role,
      },
      { new: true }
    ).select('-password -__v');

    if (!updatedUser) {
      return res.status(404).json({
        status: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      status: true,
      message: 'User updated successfully',
      data: updatedUser,
    });

  } catch (error) {
    console.error('UpdateUser Error:', error);
    return res.status(500).json({
      status: false,
      message: 'Internal Server Error',
    });
  }
};


export const changePassword = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { password, newPassword } = req.body;

    if (!id || !password || !newPassword) {
      return res.status(400).json({
        status: false,
        message: 'Missing required fields (id, password, newPassword)',
      });
    }

    const user = await User.findById(id).select('+password');
    if (!user) {
      return res.status(404).json({
        status: false,
        message: 'User not found',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        status: false,
        message: 'Invalid current password',
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({
      status: true,
      message: 'Password updated successfully',
    });

  } catch (error) {
    console.error('ChangePassword Error:', error);
    return res.status(500).json({
      status: false,
      message: 'Internal Server Error',
    });
  }
};


export const deleteUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        status: false,
        message: 'User ID is required',
      });
    }

    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({
        status: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      status: true,
      message: 'User deleted successfully',
    });

  } catch (error) {
    console.error('DeleteUser Error:', error);
    return res.status(500).json({
      status: false,
      message: 'Internal Server Error',
    });
  }
};