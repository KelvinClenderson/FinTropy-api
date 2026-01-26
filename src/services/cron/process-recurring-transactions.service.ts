import { Prisma, TransactionType } from '@prisma/client';
import { format, getDate, getDaysInMonth, setDate, startOfDay } from 'date-fns';
import { prisma } from '../../lib/prisma';
import { SystemLogsRepository } from '../../repositories/system-logs.repository'; // Importe o repo

export class ProcessRecurringTransactionsService {
  async execute() {
    const today = startOfDay(new Date());
    const currentDay = getDate(today);
    const currentMonthYear = format(today, 'yyyy-MM');
    const ACTION_NAME = 'PROCESS_RECURRING';

    const logsRepo = new SystemLogsRepository();

    // 1. VERIFICAÇÃO DE LOG (Trava de Segurança)
    // Verifica se já rodou hoje com sucesso
    const alreadyRan = await logsRepo.findLog(ACTION_NAME, today);

    if (alreadyRan && alreadyRan.status === 'SUCCESS') {
      console.log(`[CRON] Ação ${ACTION_NAME} já executada hoje. Pulando.`);
      return { status: 'SKIPPED', message: 'Já executado hoje.' };
    }

    console.log(`[CRON] Iniciando processamento: Dia ${currentDay}, Mês ${currentMonthYear}`);

    try {
      // 2. Lógica Original de Busca
      const recurringToProcess = await prisma.recurringTransaction.findMany({
        where: {
          dayOfPayment: { lte: currentDay },
          startDate: { lte: today },
          AND: [
            {
              OR: [{ lastProcessedMonth: { not: currentMonthYear } }, { lastProcessedMonth: null }],
            },
            {
              OR: [{ endDate: null }, { endDate: { gte: today } }],
            },
          ],
        },
      });

      if (recurringToProcess.length === 0) {
        // Mesmo sem transações, marcamos que rodou para não consultar de novo
        await logsRepo.createLog(ACTION_NAME, today, 'SUCCESS', 'Nenhuma transação pendente.');
        return { status: 'SUCCESS', count: 0 };
      }

      const transactionsToCreate: Prisma.TransactionCreateManyInput[] = [];
      const recurringIdsToUpdate: string[] = [];
      const daysInCurrentMonth = getDaysInMonth(today);

      for (const recurring of recurringToProcess) {
        const dayToSet = Math.min(recurring.dayOfPayment, daysInCurrentMonth);
        const transactionDate = setDate(today, dayToSet);

        transactionsToCreate.push({
          name: recurring.name,
          payee: recurring.payee,
          amount: recurring.amount,
          totalAmount: recurring.amount,
          date: transactionDate,
          type: recurring.type as TransactionType,
          paymentMethod: recurring.paymentMethod,
          categoryId: recurring.categoryId,
          creditCardId: recurring.creditCardId,
          workspaceId: recurring.workspaceId,
          recurringTransactionId: recurring.id,
          observation: recurring.observation,
          memberId: recurring.memberId,
          installmentNumber: 1,
          totalInstallments: 1,
        });

        recurringIdsToUpdate.push(recurring.id);
      }

      // 3. Transação Atômica + LOG DE SUCESSO
      await prisma.$transaction(async (tx) => {
        // Cria as transações
        await tx.transaction.createMany({
          data: transactionsToCreate,
        });

        // Atualiza as recorrências
        await tx.recurringTransaction.updateMany({
          where: { id: { in: recurringIdsToUpdate } },
          data: {
            lastProcessedMonth: currentMonthYear,
            lastGenerated: new Date(),
          },
        });

        // Cria o Log de Sucesso (Impedindo re-execução hoje)
        await tx.systemLog.create({
          data: {
            action: ACTION_NAME,
            date: today,
            status: 'SUCCESS',
            message: `${transactionsToCreate.length} transações geradas.`,
          },
        });
      });

      console.log(`[CRON] Sucesso! ${transactionsToCreate.length} transações geradas.`);
      return { status: 'SUCCESS', count: transactionsToCreate.length };
    } catch (error: any) {
      console.error('[CRON ERROR]', error);
      // Opcional: Registrar log de erro (sem travar re-execução futura, pois pode ser erro temporário)
      await logsRepo.createLog(ACTION_NAME, today, 'ERROR', error.message).catch(() => {});
      throw error;
    }
  }
}
