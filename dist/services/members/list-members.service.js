"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListMembersService = void 0;
class ListMembersService {
    constructor(membersRepository) {
        this.membersRepository = membersRepository;
    }
    async execute({ workspaceId }) {
        // Retorna a lista da tabela 'Member'.
        // O frontend usará essa lista para popular o select de "Responsável".
        const members = await this.membersRepository.findByWorkspace(workspaceId);
        return members;
    }
}
exports.ListMembersService = ListMembersService;
