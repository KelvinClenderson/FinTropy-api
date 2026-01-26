"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCreditCardController = void 0;
const zod_1 = require("zod");
const credit_cards_repository_1 = require("../../repositories/credit-cards.repository");
const update_credit_card_service_1 = require("../../services/credit-cards/update-credit-card.service");
class UpdateCreditCardController {
    async handle(req, res) {
        // Validação dos Parâmetros
        const paramSchema = zod_1.z.object({ id: zod_1.z.string().cuid().or(zod_1.z.string().uuid()) });
        const querySchema = zod_1.z.object({ workspaceId: zod_1.z.string().min(1) });
        // Validação do Body (Tudo opcional para edição parcial)
        const bodySchema = zod_1.z.object({
            name: zod_1.z.string().min(1).optional(),
            limit: zod_1.z.number().positive().optional(),
            closingDay: zod_1.z.number().min(1).max(31).optional(),
            dueDay: zod_1.z.number().min(1).max(31).optional(),
            color: zod_1.z.string().startsWith('#').length(7).optional(),
        });
        try {
            const { id } = paramSchema.parse(req.params);
            const { workspaceId } = querySchema.parse(req.query);
            const data = bodySchema.parse(req.body);
            const repo = new credit_cards_repository_1.CreditCardsRepository();
            const service = new update_credit_card_service_1.UpdateCreditCardService(repo);
            const updatedCard = await service.execute({
                id,
                workspaceId,
                ...data,
            });
            return res.json(updatedCard);
        }
        catch (err) {
            if (err instanceof zod_1.z.ZodError)
                return res.status(400).json({ issues: err.format() });
            if (err.message === 'Não autorizado.')
                return res.status(403).json({ error: err.message });
            if (err.message === 'Cartão de crédito não encontrado.')
                return res.status(404).json({ error: err.message });
            return res.status(500).json({ error: err.message });
        }
    }
}
exports.UpdateCreditCardController = UpdateCreditCardController;
