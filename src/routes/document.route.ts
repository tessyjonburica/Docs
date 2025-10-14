import express from 'express';
import {
  createDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
} from '../controllers/document.controller';

import { verifyToken } from '../utils/jwt.utils';

const documentRouter = express.Router();

documentRouter.use(verifyToken);

documentRouter.post('/new', createDocument);
documentRouter.get('/get-all-docs', getDocuments);
documentRouter.get('/get-docs/:id', getDocumentById);
documentRouter.put('/update-docs/:id', updateDocument);
documentRouter.delete('/delete-docs/:id', deleteDocument);

export default documentRouter;
