import Document from '../models/document.model';
import Version from '../models/version.model';
import { Types } from 'mongoose';

export const createDocument = async (title: string, content: string, userId: string) => {
  const document = await Document.create({
    title,
    content: Buffer.from(content, 'utf-8'),
    owner: userId,
    collaborators: [userId],
    lastEditedBy: userId,
  });

  
  await Version.create({
    documentId: document._id,
    userId,
    content, 
    versionNumber: 1,
    changes: 'Initial version',
  });

  return document;
};

export const getDocumentsByUser = async (userId: string) => {
  const documents = await Document.find({
    collaborators: userId,
  }).sort({ updatedAt: -1 });

  return documents;
};


export const getDocumentById = async (id: string) => {
  const document = await Document.findById(id)
    .populate('owner', 'firstName lastName email')
    .populate('collaborators', 'firstName lastName email');


  if (document && document.content) {
    const decoded = document.content.toString('utf-8');
    (document as any)._doc.decodedContent = decoded;
  }

  return document;
};


export const updateDocumentContent = async (
  documentId: string,
  newContent: string,
  userId: string
) => {
  const document = await Document.findById(documentId);
  if (!document) throw new Error('Document not found');


  const lastVersion = await Version.findOne({ documentId })
    .sort({ versionNumber: -1 })
    .limit(1);

  const nextVersionNumber = lastVersion ? lastVersion.versionNumber + 1 : 1;

 
  await Version.create({
    documentId,
    userId,
    content: newContent,
    versionNumber: nextVersionNumber,
    changes: `Edited by user ${userId}`,
  });

  document.content = Buffer.from(newContent, 'utf-8');
  document.lastEditedBy = new Types.ObjectId(userId);
  document.updatedAt = new Date();

  await document.save();

  return document;
};

export const deleteDocument = async (id: string) => {
  await Version.deleteMany({ documentId: id });
  await Document.findByIdAndDelete(id);
  return true;
};