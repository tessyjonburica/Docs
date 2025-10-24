"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDocument = exports.updateDocumentContent = exports.getDocumentById = exports.getDocumentsByUser = exports.createDocument = void 0;
const document_model_1 = __importDefault(require("../models/document.model"));
const version_model_1 = __importDefault(require("../models/version.model"));
const mongoose_1 = require("mongoose");
const createDocument = async (title, content, userId) => {
    const document = await document_model_1.default.create({
        title,
        content: Buffer.from(content, 'utf-8'),
        owner: userId,
        collaborators: [userId],
        lastEditedBy: userId,
    });
    await version_model_1.default.create({
        documentId: document._id,
        userId,
        content,
        versionNumber: 1,
        changes: 'Initial version',
    });
    return document;
};
exports.createDocument = createDocument;
const getDocumentsByUser = async (userId) => {
    const documents = await document_model_1.default.find({
        collaborators: userId,
    }).sort({ updatedAt: -1 });
    return documents;
};
exports.getDocumentsByUser = getDocumentsByUser;
const getDocumentById = async (id) => {
    const document = await document_model_1.default.findById(id)
        .populate('owner', 'firstName lastName email')
        .populate('collaborators', 'firstName lastName email');
    if (document && document.content) {
        const decoded = document.content.toString('utf-8');
        document._doc.decodedContent = decoded;
    }
    return document;
};
exports.getDocumentById = getDocumentById;
const updateDocumentContent = async (documentId, newContent, userId) => {
    const document = await document_model_1.default.findById(documentId);
    if (!document)
        throw new Error('Document not found');
    const lastVersion = await version_model_1.default.findOne({ documentId })
        .sort({ versionNumber: -1 })
        .limit(1);
    const nextVersionNumber = lastVersion ? lastVersion.versionNumber + 1 : 1;
    await version_model_1.default.create({
        documentId,
        userId,
        content: newContent,
        versionNumber: nextVersionNumber,
        changes: `Edited by user ${userId}`,
    });
    document.content = Buffer.from(newContent, 'utf-8');
    document.lastEditedBy = new mongoose_1.Types.ObjectId(userId);
    document.updatedAt = new Date();
    await document.save();
    return document;
};
exports.updateDocumentContent = updateDocumentContent;
const deleteDocument = async (id) => {
    await version_model_1.default.deleteMany({ documentId: id });
    await document_model_1.default.findByIdAndDelete(id);
    return true;
};
exports.deleteDocument = deleteDocument;
