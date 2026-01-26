"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCreditCardService = void 0;
class UpdateCreditCardService {
    constructor(creditCardsRepository) {
        this.creditCardsRepository = creditCardsRepository;
    }
    async execute({ id, workspaceId, ...data }) {
        // 1. Verifica se o cartão existe
        const card = await this.creditCardsRepository.findById(id);
        if (!card) {
            throw new Error('Cartão de crédito não encontrado.');
        }
        // 2. Segurança: Garante que pertence ao workspace do usuário
        if (card.workspaceId !== workspaceId) {
            throw new Error('Não autorizado.');
        }
        // 3. Atualiza apenas os campos enviados
        const updatedCard = await this.creditCardsRepository.update(id, {
            ...data,
        });
        return updatedCard;
    }
}
exports.UpdateCreditCardService = UpdateCreditCardService;
