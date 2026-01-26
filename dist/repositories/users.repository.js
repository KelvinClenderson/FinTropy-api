"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersRepository = void 0;
const prisma_1 = require("../lib/prisma");
class UsersRepository {
    async findByEmail(email) {
        return await prisma_1.prisma.user.findUnique({
            where: { email },
        });
    }
    async findById(id) {
        return await prisma_1.prisma.user.findUnique({
            where: { id },
        });
    }
    async updateSettings(userId, themeMode, primaryColor) {
        return await prisma_1.prisma.user.update({
            where: { id: userId },
            data: {
                themeMode,
                primaryColor,
            },
            select: {
                id: true,
                name: true,
                email: true,
                themeMode: true,
                primaryColor: true,
                onboardingComplete: true,
            },
        });
    }
    async completeOnboarding(userId) {
        return await prisma_1.prisma.user.update({
            where: { id: userId },
            data: {
                onboardingComplete: true,
            },
        });
    }
}
exports.UsersRepository = UsersRepository;
