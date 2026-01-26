"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemLogsRepository = void 0;
const prisma_1 = require("../lib/prisma");
class SystemLogsRepository {
    async findLog(action, date) {
        return await prisma_1.prisma.systemLog.findUnique({
            where: {
                action_date: {
                    action,
                    date,
                },
            },
        });
    }
    async createLog(action, date, status, message) {
        return await prisma_1.prisma.systemLog.create({
            data: {
                action,
                date,
                status,
                message,
            },
        });
    }
}
exports.SystemLogsRepository = SystemLogsRepository;
