import { Role, TransactionType } from '@prisma/client';
import { prisma } from '../../lib/prisma';

interface IRequest {
  userId: string;
  name: string;
}

export class CreateWorkspaceService {
  async execute({ userId, name }: IRequest) {
    // 1. Definição das categorias padrão (Igual ao RegisterUserService)
    const defaultCategories = [
      // DESPESAS
      { name: 'Moradia', type: TransactionType.EXPENSE, icon: 'Home', color: '#f44336' },
      { name: 'Transporte', type: TransactionType.EXPENSE, icon: 'Car', color: '#ff9800' },
      { name: 'Alimentação', type: TransactionType.EXPENSE, icon: 'Utensils', color: '#f44336' },
      { name: 'Entretenimento', type: TransactionType.EXPENSE, icon: 'Ticket', color: '#e91e63' },
      { name: 'Saúde', type: TransactionType.EXPENSE, icon: 'Stethoscope', color: '#4caf50' },
      { name: 'Utilidades', type: TransactionType.EXPENSE, icon: 'Wrench', color: '#607d8b' },
      { name: 'Educação', type: TransactionType.EXPENSE, icon: 'GraduationCap', color: '#673ab7' },
      { name: 'Outros', type: TransactionType.EXPENSE, icon: 'Tag', color: '#9e9e9e' },
      // RECEITAS
      { name: 'Salário', type: TransactionType.DEPOSIT, icon: 'DollarSign', color: '#4caf50' },
      { name: 'Freelance', type: TransactionType.DEPOSIT, icon: 'Briefcase', color: '#8bc34a' },
      // INVESTIMENTO
      {
        name: 'Investimentos',
        type: TransactionType.INVESTMENT,
        icon: 'PiggyBank',
        color: '#ffc107',
      },
    ];

    // 2. Transação Atômica: Cria Workspace + Vínculo Admin + Categorias
    const workspace = await prisma.workspace.create({
      data: {
        name,
        // Vincula o criador no campo de referência (opcional, mas bom para rastreio)
        userId: userId,
        workspaceUsers: {
          create: {
            userId: userId,
            role: Role.ADMIN, // O criador é sempre ADMIN
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
