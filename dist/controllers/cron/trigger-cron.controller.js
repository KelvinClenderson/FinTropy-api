"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TriggerCronController = void 0;
const process_recurring_transactions_service_1 = require("../../services/cron/process-recurring-transactions.service");
class TriggerCronController {
    async handle(req, res) {
        try {
            // Opcional: Adicionar uma verificação de Secret Key no Header para segurança extra
            // const secret = req.headers['x-cron-secret'];
            // if (secret !== process.env.CRON_SECRET) return res.status(401).send();
            const service = new process_recurring_transactions_service_1.ProcessRecurringTransactionsService();
            const result = await service.execute();
            return res.json(result);
        }
        catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }
}
exports.TriggerCronController = TriggerCronController;
