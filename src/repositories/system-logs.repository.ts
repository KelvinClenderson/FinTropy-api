import { prisma } from '../lib/prisma';

export class SystemLogsRepository {
  async findLog(action: string, date: Date) {
    return await prisma.systemLog.findUnique({
      where: {
        action_date: {
          action,
          date,
        },
      },
    });
  }

  async createLog(action: string, date: Date, status: string, message?: string) {
    return await prisma.systemLog.create({
      data: {
        action,
        date,
        status,
        message,
      },
    });
  }
}
