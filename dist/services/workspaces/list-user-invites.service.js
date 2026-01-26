"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListUserInvitesService = void 0;
class ListUserInvitesService {
    constructor(workspacesRepository) {
        this.workspacesRepository = workspacesRepository;
    }
    async execute({ userEmail }) {
        return await this.workspacesRepository.findInvitesByUserEmail(userEmail);
    }
}
exports.ListUserInvitesService = ListUserInvitesService;
