"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetTransactionController = void 0;
const transactions_repository_1 = require("../../repositories/transactions.repository");
class GetTransactionController {
    async handle(req, res) {
        // 👇 Correção: Forçamos a tipagem para garantir que é string
        const { id } = req.params;
        const repo = new transactions_repository_1.TransactionsRepository();
        const transaction = await repo.findById(id);
        if (!transaction)
            return res.status(404).json({ error: 'Transaction not found' });
        return res.json(transaction);
    }
}
exports.GetTransactionController = GetTransactionController;
