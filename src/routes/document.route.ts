import express from 'express';
import {
  createDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
} from '../controllers/document.controller';

import { protectGuard } from '../middlewares/auth.middleware';

const documentRouter = express.Router();

documentRouter.use(protectGuard);

documentRouter.post('/new', createDocument);
documentRouter.get('/get-all-docs', getDocuments);
documentRouter.get('/get-docs/:id', getDocumentById);
documentRouter.put('/update-docs/:id', updateDocument);
documentRouter.delete('/delete-docs/:id', deleteDocument);

export default documentRouter;
