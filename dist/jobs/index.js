"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startCronJobs = startCronJobs;
const node_cron_1 = __importDefault(require("node-cron"));
const process_recurring_transactions_service_1 = require("../services/cron/process-recurring-transactions.service");
function startCronJobs() {
    const recurringService = new process_recurring_transactions_service_1.ProcessRecurringTransactionsService();
    console.log('⏰ Cron Jobs inicializados');
    // Job 1: Processar Recorrências (MANTIDO)
    node_cron_1.default.schedule('1 0 * * *', async () => {
        try {
            await recurringService.execute();
        }
        catch (error) {
            console.error('[CRON ERROR] Falha ao processar recorrências:', error);
        }
    }, {
        timezone: 'America/Sao_Paulo',
    });
    // O Job de Reset de Limites foi removido.
}
