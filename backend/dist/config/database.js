"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const dotenv_1 = __importDefault(require("dotenv"));
const Room_1 = require("../entities/Room");
const Booking_1 = require("../entities/Booking");
dotenv_1.default.config();
// Enable SSL for remote databases (like Render, Railway, etc.)
// Check if DATABASE_URL is a remote database (not localhost)
const isRemoteDatabase = process.env.DATABASE_URL &&
    !process.env.DATABASE_URL.includes('localhost') &&
    !process.env.DATABASE_URL.includes('127.0.0.1');
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [Room_1.Room, Booking_1.Booking],
    synchronize: false,
    logging: process.env.NODE_ENV === 'development',
    ssl: isRemoteDatabase || process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
});
const initializeDatabase = async () => {
    try {
        await exports.AppDataSource.initialize();
    }
    catch (error) {
        throw error;
    }
};
exports.initializeDatabase = initializeDatabase;
