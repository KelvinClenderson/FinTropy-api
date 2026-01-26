"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateCreditCardController = void 0;
const zod_1 = require("zod");
const credit_cards_repository_1 = require("../../repositories/credit-cards.repository");
const create_credit_card_service_1 = require("../../services/credit-cards/create-credit-card.service");
class CreateCreditCardController {
    async handle(req, res) {
        const createCardSchema = zod_1.z.object({
            name: zod_1.z.string().min(1),
            limit: zod_1.z.number().positive(),
            closingDay: zod_1.z.number().min(1).max(31),
            dueDay: zod_1.z.number().min(1).max(31),
            color: zod_1.z.string().startsWith('#').length(7),
            workspaceId: zod_1.z.string().uuid().or(zod_1.z.string().cuid()), // Aceita ambos formatos
        });
        try {
            const data = createCardSchema.parse(req.body);
            const creditCardsRepository = new credit_cards_repository_1.CreditCardsRepository();
            const createCreditCardService = new create_credit_card_service_1.CreateCreditCardService(creditCardsRepository);
            const creditCard = await createCreditCardService.execute(data);
            return res.status(201).json(creditCard);
        }
        catch (err) {
            if (err instanceof zod_1.z.ZodError) {
                return res.status(400).json({ message: 'Erro de validação', issues: err.format() });
            }
            return res.status(400).json({ error: err.message });
        }
    }
}
exports.CreateCreditCardController = CreateCreditCardController;
