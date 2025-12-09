import { Request, Response, NextFunction } from 'express';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { User } from '@prisma/client';
import { UserService } from '../services/user.service';

// Extend Express Request to include user info
export interface AuthenticatedRequest extends Request {
  cognitoUser?: {
    sub: string; // Cognito user ID
    email: string;
    name?: string;
    tokenUse: string;
  };
  user?: User;
}

// Create JWT verifier for Cognito
const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.COGNITO_USER_POOL_ID!,
  tokenUse: 'id', // Use 'id' token (contains user attributes)
  clientId: process.env.COGNITO_CLIENT_ID!,
});

const userService = new UserService();

/**
 * Middleware to authenticate requests using Cognito JWT
 */
export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'No authorization header provided',
      });
      return;
    }

    // Check Bearer format
    if (!authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid authorization format. Use: Bearer <token>',
      });
      return;
    }

    // Extract token
    const token = authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'No token provided',
      });
      return;
    }

    // Verify token with Cognito
    const payload = await verifier.verify(token);
    // Storage cognito user info in request
    req.cognitoUser = {
      sub: payload.sub,
      email: payload.email as string,
      name: payload.name as string | undefined,
      tokenUse: payload.token_use,
    };

    // Find or create user in RDS
    const user = await userService.findOrCreateUser({
      cognitoId: payload.sub,
      email: payload.email as string,
      name: payload.name as string | undefined,
    });

    // Add RDS user to request
    req.user = user;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);

    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired token',
    });
  }
};

/**
 * Optional auth middleware - doesn't fail if no token
 * Useful for routes that work with or without authentication
 */
export const optionalAuthMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];

      if (token) {
        const payload = await verifier.verify(token);

        req.cognitoUser = {
          sub: payload.sub,
          email: payload.email as string,
          name: payload.name as string | undefined,
          tokenUse: payload.token_use,
        };
      }
    }

    next();
  } catch (error) {
    // Token invalid but we continue without user
    console.warn('Optional auth failed:', error);
    next();
  }
};
