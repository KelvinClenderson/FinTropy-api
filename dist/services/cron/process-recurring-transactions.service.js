"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessRecurringTransactionsService = void 0;
const date_fns_1 = require("date-fns");
const prisma_1 = require("../../lib/prisma");
const system_logs_repository_1 = require("../../repositories/system-logs.repository"); // Importe o repo
class ProcessRecurringTransactionsService {
    async execute() {
        const today = (0, date_fns_1.startOfDay)(new Date());
        const currentDay = (0, date_fns_1.getDate)(today);
        const currentMonthYear = (0, date_fns_1.format)(today, 'yyyy-MM');
        const ACTION_NAME = 'PROCESS_RECURRING';
        const logsRepo = new system_logs_repository_1.SystemLogsRepository();
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
            const recurringToProcess = await prisma_1.prisma.recurringTransaction.findMany({
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
            const transactionsToCreate = [];
            const recurringIdsToUpdate = [];
            const daysInCurrentMonth = (0, date_fns_1.getDaysInMonth)(today);
            for (const recurring of recurringToProcess) {
                const dayToSet = Math.min(recurring.dayOfPayment, daysInCurrentMonth);
                const transactionDate = (0, date_fns_1.setDate)(today, dayToSet);
                transactionsToCreate.push({
                    name: recurring.name,
                    payee: recurring.payee,
                    amount: recurring.amount,
                    totalAmount: recurring.amount,
                    date: transactionDate,
                    type: recurring.type,
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
            await prisma_1.prisma.$transaction(async (tx) => {
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
        }
        catch (error) {
            console.error('[CRON ERROR]', error);
            // Opcional: Registrar log de erro (sem travar re-execução futura, pois pode ser erro temporário)
            await logsRepo.createLog(ACTION_NAME, today, 'ERROR', error.message).catch(() => { });
            throw error;
        }
    }
}
exports.ProcessRecurringTransactionsService = ProcessRecurringTransactionsService;
