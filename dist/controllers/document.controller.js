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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDocument = exports.updateDocument = exports.getDocumentById = exports.getDocuments = exports.createDocument = void 0;
const documentService = __importStar(require("../services/document.service"));
const createDocument = async (req, res) => {
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
    }
    catch (error) {
        console.error('Error creating document:', error);
        return res.status(500).json({
            status: false,
            message: 'Failed to create document',
            error: error.message,
        });
    }
};
exports.createDocument = createDocument;
const getDocuments = async (req, res) => {
    try {
        const userId = req.params.id;
        if (!userId) {
            return res.status(401).json({ status: false, message: 'Unauthorized' });
        }
        const documents = await documentService.getDocumentsByUser(userId);
        return res.status(200).json({
            status: true,
            message: 'Documents fetched successfully',
            data: documents,
        });
    }
    catch (error) {
        console.error('Error fetching documents:', error);
        return res.status(500).json({
            status: false,
            message: 'Failed to fetch documents',
            error: error.message,
        });
    }
};
exports.getDocuments = getDocuments;
const getDocumentById = async (req, res) => {
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
    }
    catch (error) {
        console.error('Error fetching document:', error);
        return res.status(500).json({
            status: false,
            message: 'Failed to fetch document',
            error: error.message,
        });
    }
};
exports.getDocumentById = getDocumentById;
const updateDocument = async (req, res) => {
    try {
        const { content } = req.body;
        const userId = req.params.id;
        if (!userId) {
            return res.status(401).json({ status: false, message: 'Unauthorized' });
        }
        const updated = await documentService.updateDocumentContent(userId, content, userId);
        return res.status(200).json({
            status: true,
            message: 'Document updated successfully',
            data: updated,
        });
    }
    catch (error) {
        console.error('Error updating document:', error);
        return res.status(500).json({
            status: false,
            message: 'Failed to update document',
            error: error.message,
        });
    }
};
exports.updateDocument = updateDocument;
const deleteDocument = async (req, res) => {
    try {
        const { id } = req.params;
        await documentService.deleteDocument(id);
        return res.status(200).json({
            status: true,
            message: 'Document deleted successfully',
        });
    }
    catch (error) {
        console.error('Error deleting document:', error);
        return res.status(500).json({
            status: false,
            message: 'Failed to delete document',
            error: error.message,
        });
    }
};
exports.deleteDocument = deleteDocument;
