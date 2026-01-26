import cron from 'node-cron';
import { ProcessRecurringTransactionsService } from '../services/cron/process-recurring-transactions.service';

export function startCronJobs() {
  const recurringService = new ProcessRecurringTransactionsService();

  console.log('⏰ Cron Jobs inicializados');

  // Job 1: Processar Recorrências (MANTIDO)
  cron.schedule(
    '1 0 * * *',
    async () => {
      try {
        await recurringService.execute();
      } catch (error) {
        console.error('[CRON ERROR] Falha ao processar recorrências:', error);
      }
    },
    {
      timezone: 'America/Sao_Paulo',
    },
  );

  // O Job de Reset de Limites foi removido.
}
