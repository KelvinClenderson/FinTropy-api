import { prisma } from '../lib/prisma';

export class UsersRepository {
  async findByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
    });
  }

  async updateSettings(userId: string, themeMode: string, primaryColor: string) {
    return await prisma.user.update({
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

  async completeOnboarding(userId: string) {
    return await prisma.user.update({
      where: { id: userId },
      data: {
        onboardingComplete: true,
      },
    });
  }
}
