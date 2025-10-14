import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
    id: string;
    role: string;
}

export const protectGuard = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized'
        });
    }


    try {
        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(
            token,
            process.env.JWT_SECRET as string
        ) as JwtPayload;

        (req as any).user = decodedToken;
        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized'
        });
    }
}

//role based access control
export const roleGuard = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const userRole = (req as any).user.role;
        if (!roles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden'
            });
        }
        next();
    }
}
