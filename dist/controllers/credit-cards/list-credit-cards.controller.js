"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListCreditCardsController = void 0;
const zod_1 = require("zod");
const credit_cards_repository_1 = require("../../repositories/credit-cards.repository");
class ListCreditCardsController {
    async handle(req, res) {
        const listCardsSchema = zod_1.z.object({
            workspaceId: zod_1.z.string(),
        });
        try {
            // Pega o workspaceId da URL (Query Params)
            const { workspaceId } = listCardsSchema.parse(req.query);
            const creditCardsRepository = new credit_cards_repository_1.CreditCardsRepository();
            const creditCards = await creditCardsRepository.findByWorkspace(workspaceId);
            return res.json(creditCards);
        }
        catch (err) {
            return res.status(400).json({ error: 'Workspace ID is required' });
        }
    }
}
exports.ListCreditCardsController = ListCreditCardsController;
