import * as Y from 'yjs';
import { Server, Socket } from 'socket.io';
import Document from '../models/document.model';
// import * as syncProtocol from 'y-protocols/sync';

const yDocs = new Map<string, Y.Doc>();

const getOrCreateYDoc = async (documentId: string): Promise<Y.Doc> => {
  if (yDocs.has(documentId)) return yDocs.get(documentId)!;

  const ydoc = new Y.Doc();
  const existingDoc = await Document.findById(documentId);

  if (existingDoc?.content) {
    try {
      const contentBuffer = new Uint8Array(existingDoc.content as any);
      Y.applyUpdate(ydoc, contentBuffer);
    } catch (err) {
      console.error('Error applying stored Yjs update:', err);
    }
  }

  ydoc.on('update', async () => {
    try {
      const update = Y.encodeStateAsUpdate(ydoc);
      await Document.findByIdAndUpdate(documentId, {
        content: Array.from(update),
        updatedAt: new Date(),
      });
    } catch (err) {
      console.error('Error saving Yjs update:', err);
    }
  });

  yDocs.set(documentId, ydoc);
  return ydoc;
};

export const setupYjsHandlers = async (
  io: Server,
  socket: Socket,
  documentId: string,
  user: { id: string; email?: string; role: string }
) => {
  const ydoc = await getOrCreateYDoc(documentId);

  // initial document sync
  const state = Y.encodeStateAsUpdate(ydoc);
  socket.emit('doc-sync', Array.from(state));

  socket.on('doc-update', (updateArray: number[]) => {
    const update = new Uint8Array(updateArray);
    Y.applyUpdate(ydoc, update);

    // broadcast to others in same doc room
    socket.to(documentId).emit('doc-update', updateArray);
  });

  socket.on('disconnect', () => {
    console.log(`User ${user.id} disconnected from document ${documentId}`);
  });
};
