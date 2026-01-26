"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteCreditCardController = void 0;
const zod_1 = require("zod");
const credit_cards_repository_1 = require("../../repositories/credit-cards.repository");
class DeleteCreditCardController {
    async handle(req, res) {
        const deleteCardSchema = zod_1.z.object({
            id: zod_1.z.string().cuid().or(zod_1.z.string().uuid()), // Aceita ID do cartão
        });
        try {
            const { id } = deleteCardSchema.parse(req.params);
            const creditCardsRepository = new credit_cards_repository_1.CreditCardsRepository();
            // TODO: Futuramente, validar se tem transações vinculadas antes de deletar
            // Por enquanto, deleta direto
            await creditCardsRepository.delete(id);
            return res.status(204).send(); // 204 = No Content (Sucesso sem corpo)
        }
        catch (err) {
            return res.status(400).json({ error: 'Invalid ID' });
        }
    }
}
exports.DeleteCreditCardController = DeleteCreditCardController;
