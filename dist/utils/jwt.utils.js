"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const secretKey = process.env.JWT_SECRET;
if (!secretKey) {
    throw new Error('JWT_SECRET is not defined in environment variables');
}
const expiresIn = (process.env.JWT_EXPIRES_IN || '1h');
const generateToken = (user) => {
    const payload = {
        id: user.id.toString(),
        email: user.email,
        role: user.role,
    };
    const options = { expiresIn };
    return jsonwebtoken_1.default.sign(payload, secretKey, options);
};
exports.generateToken = generateToken;
const verifyToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, secretKey);
    }
    catch {
        return null;
    }
};
exports.verifyToken = verifyToken;
