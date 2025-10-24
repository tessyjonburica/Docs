"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const userRouter = express_1.default.Router();
userRouter.post('/register', user_controller_1.registerUser);
userRouter.post('/login', user_controller_1.login);
userRouter.get('/get-user/:id', auth_middleware_1.protectGuard, user_controller_1.getUserById);
userRouter.get('/get-all-users', auth_middleware_1.protectGuard, (0, auth_middleware_1.roleGuard)(['admin']), user_controller_1.getAllUsers);
userRouter.delete('/delete-user/:id', auth_middleware_1.protectGuard, (0, auth_middleware_1.roleGuard)(['admin']), user_controller_1.deleteUserById);
userRouter.put('/update-profile/:id', auth_middleware_1.protectGuard, (0, auth_middleware_1.roleGuard)(['admin', 'user']), user_controller_1.updateUserById);
userRouter.put('/change-password/:id', auth_middleware_1.protectGuard, user_controller_1.changePassword);
exports.default = userRouter;
