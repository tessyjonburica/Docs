import { Request, Response } from 'express';
import * as documentService from '../services/document.service';

export const createDocument = async (req: Request, res: Response) => {
    try {
        const { userId, title, content } = req.body;

        if (!userId) {
            return res.status(401).json({
                status: false,
                message: 'Unauthorized: Missing user ID',
            });
        }

        const document = await documentService.createDocument(title, content, userId);

        return res.status(201).json({
            status: true,
            message: 'Document created successfully',
            data: document,
        });
    } catch (error: any) {
        console.error('Error creating document:', error);
        return res.status(500).json({
            status: false,
            message: 'Failed to create document',
            error: error.message,
        });
    }
};

export const getDocuments = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;

        if (!userId) {
            return res.status(401).json({ status: false, message: 'Unauthorized' });
        }

        const documents = await documentService.getDocumentsByUser(userId);

        return res.status(200).json({
            status: true,
            message: 'Documents fetched successfully',
            data: documents,
        });
    } catch (error: any) {
        console.error('Error fetching documents:', error);
        return res.status(500).json({
            status: false,
            message: 'Failed to fetch documents',
            error: error.message,
        });
    }
};

export const getDocumentById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const document = await documentService.getDocumentById(id);

        if (!document) {
            return res.status(404).json({ status: false, message: 'Document not found' });
        }

        return res.status(200).json({
            status: true,
            message: 'Document fetched successfully',
            data: document,
        });
    } catch (error: any) {
        console.error('Error fetching document:', error);
        return res.status(500).json({
            status: false,
            message: 'Failed to fetch document',
            error: error.message,
        });
    }
};

export const updateDocument = async (req: Request, res: Response) => {
    try {
        const { content } = req.body;
        const { id: documentId } = req.params;
        const userId = (req as any).user?.id;

        if (!documentId || !userId) {
            return res.status(401).json({ status: false, message: 'Unauthorized' });
        }

        const updated = await documentService.updateDocumentContent(documentId, content, userId);

        return res.status(200).json({
            status: true,
            message: 'Document updated successfully',
            data: updated,
        });
    } catch (error: any) {
        console.error('Error updating document:', error);
        return res.status(500).json({
            status: false,
            message: 'Failed to update document',
            error: error.message,
        });
    }
};

export const deleteDocument = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await documentService.deleteDocument(id);

        return res.status(200).json({
            status: true,
            message: 'Document deleted successfully',
        });
    } catch (error: any) {
        console.error('Error deleting document:', error);
        return res.status(500).json({
            status: false,
            message: 'Failed to delete document',
            error: error.message,
        });
    }
};
