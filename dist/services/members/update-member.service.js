"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateMemberService = void 0;
class UpdateMemberService {
    constructor(membersRepository) {
        this.membersRepository = membersRepository;
    }
    async execute({ id, workspaceId, name }) {
        const member = await this.membersRepository.findById(id);
        if (!member)
            throw new Error('Responsável não encontrado.');
        if (member.workspaceId !== workspaceId)
            throw new Error('Não autorizado.');
        return await this.membersRepository.update(id, { name });
    }
}
exports.UpdateMemberService = UpdateMemberService;
