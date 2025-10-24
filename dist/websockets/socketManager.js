"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeSocketServer = void 0;
const socket_io_1 = require("socket.io");
const jwt_utils_1 = require("../utils/jwt.utils");
const yjsHandler_1 = require("./yjsHandler");
const documentUsers = new Map();
const initializeSocketServer = (server) => {
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || '*',
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });
    io.on('connection', (socket) => {
        console.log(`Socket connected: ${socket.id}`);
        socket.on('auth', (token) => {
            const payload = (0, jwt_utils_1.verifyToken)(token);
            if (!payload) {
                socket.emit('unauthorized', { message: 'Invalid or expired token' });
                socket.disconnect(true);
                return;
            }
            socket.data.user = {
                id: payload.id,
                email: payload.email,
                role: payload.role,
            };
            socket.emit('authenticated', { user: socket.data.user });
        });
        socket.on('join-document', async (data) => {
            const user = socket.data.user;
            if (!user) {
                socket.emit('error', { message: 'Unauthorized - please auth first' });
                return;
            }
            const { documentId } = data;
            socket.join(documentId);
            if (!documentUsers.has(documentId))
                documentUsers.set(documentId, new Set());
            documentUsers.get(documentId).add(user.id);
            io.to(documentId).emit('user-joined', {
                userId: user.id,
                activeUsers: Array.from(documentUsers.get(documentId) || []),
            });
            await (0, yjsHandler_1.setupYjsHandlers)(io, socket, documentId, user);
        });
        socket.on('leave-document', (data) => {
            const user = socket.data.user;
            if (!user)
                return;
            const { documentId } = data;
            socket.leave(documentId);
            documentUsers.get(documentId)?.delete(user.id);
            io.to(documentId).emit('user-left', {
                userId: user.id,
                activeUsers: Array.from(documentUsers.get(documentId) || []),
            });
        });
        socket.on('disconnect', () => {
            const user = socket.data.user;
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
exports.initializeSocketServer = initializeSocketServer;
