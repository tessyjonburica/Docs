"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const http_1 = __importDefault(require("http"));
const user_route_1 = __importDefault(require("./routes/user.route"));
const document_route_1 = __importDefault(require("./routes/document.route"));
const socketManager_1 = require("./websockets/socketManager");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// API Routes
app.use('/api/users', user_route_1.default);
app.use('/api/documents', document_route_1.default);
const connectDB = async () => {
    try {
        await mongoose_1.default.connect(process.env.MONGO_URI || '');
        console.log('Connected to MongoDB');
    }
    catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};
(0, socketManager_1.initializeSocketServer)(server);
const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
    await connectDB();
    console.log(`Server running on port ${PORT}`);
});
mongoose_1.default.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected! Attempting to reconnect...');
    connectDB();
});
exports.default = app;
