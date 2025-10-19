import http from 'http';
import { Server, Socket } from 'socket.io';
import { verifyToken } from '../utils/jwt.utils';
import { setupYjsHandlers } from './yjsHandler';

type MinimalUser = { id: string; email?: string; role: string };

const documentUsers = new Map<string, Set<string>>();

export const initializeSocketServer = (server: http.Server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`Socket connected: ${socket.id}`);


    socket.on('auth', (token: string) => {
      const payload = verifyToken(token);
      if (!payload) {
        socket.emit('unauthorized', { message: 'Invalid or expired token' });
        socket.disconnect(true);
        return;
      }

      (socket.data as any).user = {
        id: payload.id,
        email: payload.email,
        role: payload.role,
      } as MinimalUser;

      socket.emit('authenticated', { user: (socket.data as any).user });
    });

    socket.on('join-document', async (data: { documentId: string }) => {
      const user = (socket.data as any).user as MinimalUser | undefined;
      if (!user) {
        socket.emit('error', { message: 'Unauthorized - please auth first' });
        return;
      }

      const { documentId } = data;
      socket.join(documentId);

      if (!documentUsers.has(documentId)) documentUsers.set(documentId, new Set());
      documentUsers.get(documentId)!.add(user.id);

      io.to(documentId).emit('user-joined', {
        userId: user.id,
        activeUsers: Array.from(documentUsers.get(documentId) || []),
      });

      await setupYjsHandlers(io, socket, documentId, user);
    });

   
    socket.on('leave-document', (data: { documentId: string }) => {
      const user = (socket.data as any).user as MinimalUser | undefined;
      if (!user) return;

      const { documentId } = data;
      socket.leave(documentId);

      documentUsers.get(documentId)?.delete(user.id);

      io.to(documentId).emit('user-left', {
        userId: user.id,
        activeUsers: Array.from(documentUsers.get(documentId) || []),
      });
    });

    
    socket.on('disconnect', () => {
      const user = (socket.data as any).user as MinimalUser | undefined;
      if (!user) {
        console.log(`Socket disconnected: ${socket.id}`);
        return;
      }

      for (const [docId, set] of documentUsers.entries()) {
        if (set.has(user.id)) {
          set.delete(user.id);
          io.to(docId).emit('user-left', {
            userId: user.id,
            activeUsers: Array.from(set),
          });
        }
      }

      console.log(`Socket disconnected: ${socket.id} (user ${user.id})`);
    });
  });

  console.log('Socket.IO server initialized');
  return io;
};