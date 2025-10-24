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
exports.setupYjsHandlers = void 0;
const Y = __importStar(require("yjs"));
const document_model_1 = __importDefault(require("../models/document.model"));
// import * as syncProtocol from 'y-protocols/sync';
const yDocs = new Map();
const getOrCreateYDoc = async (documentId) => {
    if (yDocs.has(documentId))
        return yDocs.get(documentId);
    const ydoc = new Y.Doc();
    const existingDoc = await document_model_1.default.findById(documentId);
    if (existingDoc?.content) {
        try {
            const contentBuffer = new Uint8Array(existingDoc.content);
            Y.applyUpdate(ydoc, contentBuffer);
        }
        catch (err) {
            console.error('Error applying stored Yjs update:', err);
        }
    }
    ydoc.on('update', async () => {
        try {
            const update = Y.encodeStateAsUpdate(ydoc);
            await document_model_1.default.findByIdAndUpdate(documentId, {
                content: Array.from(update),
                updatedAt: new Date(),
            });
        }
        catch (err) {
            console.error('Error saving Yjs update:', err);
        }
    });
    yDocs.set(documentId, ydoc);
    return ydoc;
};
const setupYjsHandlers = async (io, socket, documentId, user) => {
    const ydoc = await getOrCreateYDoc(documentId);
    // initial document sync
    const state = Y.encodeStateAsUpdate(ydoc);
    socket.emit('doc-sync', Array.from(state));
    socket.on('doc-update', (updateArray) => {
        const update = new Uint8Array(updateArray);
        Y.applyUpdate(ydoc, update);
        // broadcast to others in same doc room
        socket.to(documentId).emit('doc-update', updateArray);
    });
    socket.on('disconnect', () => {
        console.log(`User ${user.id} disconnected from document ${documentId}`);
    });
};
exports.setupYjsHandlers = setupYjsHandlers;
