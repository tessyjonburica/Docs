"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const document_controller_1 = require("../controllers/document.controller");
const jwt_utils_1 = require("../utils/jwt.utils");
const documentRouter = express_1.default.Router();
documentRouter.use(jwt_utils_1.verifyToken);
documentRouter.post('/new', document_controller_1.createDocument);
documentRouter.get('/get-all-docs', document_controller_1.getDocuments);
documentRouter.get('/get-docs/:id', document_controller_1.getDocumentById);
documentRouter.put('/update-docs/:id', document_controller_1.updateDocument);
documentRouter.delete('/delete-docs/:id', document_controller_1.deleteDocument);
exports.default = documentRouter;
