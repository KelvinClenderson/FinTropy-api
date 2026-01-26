"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetPaymentMethodsController = void 0;
const zod_1 = require("zod");
const credit_cards_repository_1 = require("../../repositories/credit-cards.repository");
class GetPaymentMethodsController {
    async handle(req, res) {
        // 1. Validação dos parametros de entrada
        const querySchema = zod_1.z.object({
            workspaceId: zod_1.z.string().min(1, 'Workspace ID é obrigatório'),
        });
        try {
            const { workspaceId } = querySchema.parse(req.query);
            // 2. Instancia o repositório CORRETO (Cartões de Crédito)
            const creditCardsRepository = new credit_cards_repository_1.CreditCardsRepository();
            // 3. Busca os cartões do workspace
            const creditCards = await creditCardsRepository.findByWorkspace(workspaceId);
            // 4. Formata o retorno
            // Aqui mapeamos os cartões para o formato que o frontend espera
            const formattedCards = creditCards.map((card) => ({
                id: card.id,
                name: card.name,
                type: 'CREDIT_CARD', // Identificador útil para o frontend saber que é cartão
                limit: Number(card.limit),
                icon: 'CreditCard', // Ícone padrão
            }));
            // Se você quiser adicionar métodos genéricos (ex: Dinheiro/Pix) além dos cartões:
            const defaultMethods = [
                {
                    id: 'money',
                    name: 'Dinheiro / Débito / PIX',
                    type: 'CASH',
                    limit: null,
                    icon: 'Wallet',
                },
            ];
            // Retorna a lista combinada (Genéricos + Cartões Reais)
            return res.json([...defaultMethods, ...formattedCards]);
        }
        catch (err) {
            if (err instanceof zod_1.z.ZodError) {
                return res.status(400).json({ issues: err.format() });
            }
            return res.status(400).json({ error: err.message });
        }
    }
}
exports.GetPaymentMethodsController = GetPaymentMethodsController;
