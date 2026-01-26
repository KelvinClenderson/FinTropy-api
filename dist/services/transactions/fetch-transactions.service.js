"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FetchTransactionsService = void 0;
class FetchTransactionsService {
    constructor(transactionsRepository) {
        this.transactionsRepository = transactionsRepository;
    }
    async execute({ workspaceId, month, year }) {
        return await this.transactionsRepository.findAllByMonth({ workspaceId, month, year });
    }
}
exports.FetchTransactionsService = FetchTransactionsService;
