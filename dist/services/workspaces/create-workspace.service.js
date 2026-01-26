"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateWorkspaceService = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = require("../../lib/prisma");
class CreateWorkspaceService {
    async execute({ userId, name }) {
        // 1. Definição das categorias padrão (Igual ao RegisterUserService)
        const defaultCategories = [
            // DESPESAS
            { name: 'Moradia', type: client_1.TransactionType.EXPENSE, icon: 'Home', color: '#f44336' },
            { name: 'Transporte', type: client_1.TransactionType.EXPENSE, icon: 'Car', color: '#ff9800' },
            { name: 'Alimentação', type: client_1.TransactionType.EXPENSE, icon: 'Utensils', color: '#f44336' },
            { name: 'Entretenimento', type: client_1.TransactionType.EXPENSE, icon: 'Ticket', color: '#e91e63' },
            { name: 'Saúde', type: client_1.TransactionType.EXPENSE, icon: 'Stethoscope', color: '#4caf50' },
            { name: 'Utilidades', type: client_1.TransactionType.EXPENSE, icon: 'Wrench', color: '#607d8b' },
            { name: 'Educação', type: client_1.TransactionType.EXPENSE, icon: 'GraduationCap', color: '#673ab7' },
            { name: 'Outros', type: client_1.TransactionType.EXPENSE, icon: 'Tag', color: '#9e9e9e' },
            // RECEITAS
            { name: 'Salário', type: client_1.TransactionType.DEPOSIT, icon: 'DollarSign', color: '#4caf50' },
            { name: 'Freelance', type: client_1.TransactionType.DEPOSIT, icon: 'Briefcase', color: '#8bc34a' },
            // INVESTIMENTO
            {
                name: 'Investimentos',
                type: client_1.TransactionType.INVESTMENT,
                icon: 'PiggyBank',
                color: '#ffc107',
            },
        ];
        // 2. Transação Atômica: Cria Workspace + Vínculo Admin + Categorias
        const workspace = await prisma_1.prisma.workspace.create({
            data: {
                name,
                // Vincula o criador no campo de referência (opcional, mas bom para rastreio)
                userId: userId,
                workspaceUsers: {
                    create: {
                        userId: userId,
                        role: client_1.Role.ADMIN, // O criador é sempre ADMIN
                    },
                },
                categories: {
                    create: defaultCategories.map((cat) => ({
                        name: cat.name,
                        type: cat.type,
                        icon: cat.icon,
                        color: cat.color,
                    })),
                },
            },
        });
        return workspace;
    }
}
exports.CreateWorkspaceService = CreateWorkspaceService;
