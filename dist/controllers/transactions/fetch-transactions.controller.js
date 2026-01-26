"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FetchTransactionsController = void 0;
const zod_1 = require("zod");
const transactions_repository_1 = require("../../repositories/transactions.repository");
const fetch_transactions_service_1 = require("../../services/transactions/fetch-transactions.service");
class FetchTransactionsController {
    async handle(req, res) {
        const querySchema = zod_1.z.object({
            workspaceId: zod_1.z.string().cuid(),
            month: zod_1.z.string().transform(Number),
            year: zod_1.z.string().transform(Number),
        });
        const { workspaceId, month, year } = querySchema.parse(req.query);
        const repo = new transactions_repository_1.TransactionsRepository();
        const service = new fetch_transactions_service_1.FetchTransactionsService(repo);
        const transactions = await service.execute({ workspaceId, month, year });
        return res.json(transactions);
    }
}
exports.FetchTransactionsController = FetchTransactionsController;
