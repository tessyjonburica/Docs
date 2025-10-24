"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserById = exports.changePassword = exports.updateUserById = exports.getAllUsers = exports.getUserById = exports.login = exports.registerUser = void 0;
const user_model_1 = __importStar(require("../models/user.model"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jwt_utils_1 = require("../utils/jwt.utils");
const registerUser = async (req, res) => {
    try {
        const { firstName, lastName, email, password, role } = req.body;
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({
                status: false,
                message: 'Missing required fields (firstName, lastName, email, password)',
            });
        }
        // Check if user exists
        const existingUser = await user_model_1.default.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                status: false,
                message: 'User already exists',
            });
        }
        // Hash password
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        // Create new user
        const user = new user_model_1.default({
            first_name: firstName,
            last_name: lastName,
            email,
            password: hashedPassword,
            role: user_model_1.ROLES.includes(role) ? role : 'user',
        });
        await user.save();
        const token = (0, jwt_utils_1.generateToken)(user);
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
    }
    catch (error) {
        console.error('Register Error:', error);
        return res.status(500).json({
            status: false,
            message: 'Internal Server Error',
        });
    }
};
exports.registerUser = registerUser;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                status: false,
                message: 'Missing required fields (email, password)',
            });
        }
        const existingUser = await user_model_1.default.findOne({ email }).select('+password');
        if (!existingUser) {
            return res.status(400).json({
                status: false,
                message: 'User does not exist',
            });
        }
        // Compare passwords
        const isPasswordValid = await bcryptjs_1.default.compare(password, existingUser.password);
        if (!isPasswordValid) {
            return res.status(400).json({
                status: false,
                message: 'Invalid credentials',
            });
        }
        // Generate token
        const token = (0, jwt_utils_1.generateToken)(existingUser);
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
    }
    catch (error) {
        console.error('Login Error:', error);
        return res.status(500).json({
            status: false,
            message: 'Internal Server Error',
        });
    }
};
exports.login = login;
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await user_model_1.default.findById(id).select('-password -__v');
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
    }
    catch (error) {
        console.error('GetUser Error:', error);
        return res.status(500).json({
            status: false,
            message: 'Internal Server Error',
        });
    }
};
exports.getUserById = getUserById;
const getAllUsers = async (_req, res) => {
    try {
        const users = await user_model_1.default.find().select('-password -__v');
        return res.status(200).json({
            status: true,
            message: 'Users fetched successfully',
            data: users,
        });
    }
    catch (error) {
        console.error('GetAllUsers Error:', error);
        return res.status(500).json({
            status: false,
            message: 'Internal Server Error',
        });
    }
};
exports.getAllUsers = getAllUsers;
const updateUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const { firstName, lastName, email, role } = req.body;
        if (!id) {
            return res.status(400).json({
                status: false,
                message: 'User ID is required',
            });
        }
        const updatedUser = await user_model_1.default.findByIdAndUpdate(id, {
            first_name: firstName,
            last_name: lastName,
            email,
            role,
        }, { new: true }).select('-password -__v');
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
    }
    catch (error) {
        console.error('UpdateUser Error:', error);
        return res.status(500).json({
            status: false,
            message: 'Internal Server Error',
        });
    }
};
exports.updateUserById = updateUserById;
const changePassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { password, newPassword } = req.body;
        if (!id || !password || !newPassword) {
            return res.status(400).json({
                status: false,
                message: 'Missing required fields (id, password, newPassword)',
            });
        }
        const user = await user_model_1.default.findById(id).select('+password');
        if (!user) {
            return res.status(404).json({
                status: false,
                message: 'User not found',
            });
        }
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({
                status: false,
                message: 'Invalid current password',
            });
        }
        user.password = await bcryptjs_1.default.hash(newPassword, 10);
        await user.save();
        return res.status(200).json({
            status: true,
            message: 'Password updated successfully',
        });
    }
    catch (error) {
        console.error('ChangePassword Error:', error);
        return res.status(500).json({
            status: false,
            message: 'Internal Server Error',
        });
    }
};
exports.changePassword = changePassword;
const deleteUserById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({
                status: false,
                message: 'User ID is required',
            });
        }
        const deletedUser = await user_model_1.default.findByIdAndDelete(id);
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
    }
    catch (error) {
        console.error('DeleteUser Error:', error);
        return res.status(500).json({
            status: false,
            message: 'Internal Server Error',
        });
    }
};
exports.deleteUserById = deleteUserById;
