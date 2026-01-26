"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListCreditCardsService = void 0;
const transactions_repository_1 = require("../../repositories/transactions.repository");
const credit_card_utils_1 = require("../../utils/credit-card.utils");
class ListCreditCardsService {
    constructor(creditCardsRepository) {
        this.creditCardsRepository = creditCardsRepository;
    }
    async execute({ workspaceId }) {
        // 1. Busca os cartões
        const cards = await this.creditCardsRepository.findByWorkspace(workspaceId);
        // Precisamos de um repo de transações para buscar o histórico
        // Nota: Em um cenário ideal, injetaríamos isso no construtor
        const transactionsRepo = new transactions_repository_1.TransactionsRepository();
        // 2. Para cada cartão, calcula o limite em tempo real
        const cardsWithLimit = await Promise.all(cards.map(async (card) => {
            // Busca transações que impactam o limite (não pagas ou futuras)
            // Otimização: Buscamos todas, mas poderíamos filtrar por data > data_corte_segura
            const transactions = await transactionsRepo.findAllByCardId(card.id);
            const { availableLimit, usedLimit } = (0, credit_card_utils_1.calculateCardLimit)(card, transactions);
            return {
                ...card,
                limit: Number(card.limit), // Garante number
                availableLimit,
                usedLimit,
            };
        }));
        return cardsWithLimit;
    }
}
exports.ListCreditCardsService = ListCreditCardsService;
