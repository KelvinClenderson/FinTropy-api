"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListRecurringTransactionsService = void 0;
class ListRecurringTransactionsService {
    constructor(recurringTransactionsRepository) {
        this.recurringTransactionsRepository = recurringTransactionsRepository;
    }
    async execute({ workspaceId }) {
        return await this.recurringTransactionsRepository.findByWorkspace(workspaceId);
    }
}
exports.ListRecurringTransactionsService = ListRecurringTransactionsService;
