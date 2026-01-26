"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteMemberService = void 0;
class DeleteMemberService {
    constructor(membersRepository) {
        this.membersRepository = membersRepository;
    }
    async execute({ id, workspaceId }) {
        const member = await this.membersRepository.findById(id);
        if (!member)
            throw new Error('Responsável não encontrado.');
        if (member.workspaceId !== workspaceId)
            throw new Error('Não autorizado.');
        // Ao deletar, o Prisma setará memberId = null nas transações (onDelete: SetNull)
        await this.membersRepository.delete(id);
    }
}
exports.DeleteMemberService = DeleteMemberService;
