"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const versionSchema = new mongoose_1.Schema({
    documentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Document', required: true },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    versionNumber: { type: Number, required: true },
    changes: { type: String, required: true },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('Version', versionSchema);
