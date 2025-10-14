import express from 'express';
import {
  registerUser,
  login,
  getUserById,
  getAllUsers,
  updateUserById,
  changePassword,
  deleteUserById
} from '../controllers/user.controller';
import { protectGuard, roleGuard } from '../middlewares/auth.middleware';

const userRouter = express.Router();


userRouter.post('/register', registerUser);
userRouter.post('/login', login);
userRouter.get('/get-user/:id', protectGuard, getUserById);
userRouter.get('/get-all-users', protectGuard, roleGuard(['admin']), getAllUsers);
userRouter.delete('/delete-user/:id', protectGuard, roleGuard(['admin']), deleteUserById);
userRouter.put('/update-profile/:id', protectGuard, roleGuard(['admin', 'user']), updateUserById);
userRouter.put('/change-password/:id', protectGuard, changePassword);

export default userRouter;
