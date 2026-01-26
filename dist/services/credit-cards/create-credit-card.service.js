"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateCreditCardService = void 0;
class CreateCreditCardService {
    constructor(creditCardsRepository) {
        this.creditCardsRepository = creditCardsRepository;
    }
    async execute({ name, limit, closingDay, dueDay, color, workspaceId }) {
        // Aqui poderíamos validar se já existe um cartão com mesmo nome, etc.
        const creditCard = await this.creditCardsRepository.create({
            name,
            limit,
            closingDay,
            dueDay,
            color,
            workspaceId,
        });
        return creditCard;
    }
}
exports.CreateCreditCardService = CreateCreditCardService;
