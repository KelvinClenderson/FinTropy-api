"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const express_rate_limit_1 = require("express-rate-limit");
const helmet_1 = __importDefault(require("helmet"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express")); // Importar UI
const auth_routes_1 = require("./routes/auth.routes");
const budgets_routes_1 = require("./routes/budgets.routes");
const categories_routes_1 = require("./routes/categories.routes");
const credit_cards_routes_1 = require("./routes/credit-cards.routes");
const cron_routes_1 = require("./routes/cron.routes");
const dashboard_routes_1 = require("./routes/dashboard.routes");
const goals_routes_1 = require("./routes/goals.routes");
const members_routes_1 = require("./routes/members.routes");
const recurring_transactions_routes_1 = require("./routes/recurring-transactions.routes");
const transactions_routes_1 = require("./routes/transactions.routes");
const users_routes_1 = require("./routes/users.routes");
const workspaces_routes_1 = require("./routes/workspaces.routes");
const swagger_output_json_1 = __importDefault(require("./swagger_output.json"));
exports.app = (0, express_1.default)();
// Middlewares Globais
exports.app.use(express_1.default.json());
exports.app.use((0, helmet_1.default)()); // Segurança de headers
exports.app.use((0, cors_1.default)()); // Permitir acesso do frontend
exports.app.use(express_1.default.json());
exports.app.use((0, helmet_1.default)()); // 1. Helmet: Protege headers HTTP
// // 2. CORS: Restringe quem pode chamar sua API (No frontend em produção)
// app.use(
//   cors({
//     origin: process.env.FRONTEND_URL || '*', // Em produção, coloque a URL exata do seu front
//   }),
// );
// 3. Rate Limit: Evita ataques de força bruta (ex: 100 reqs por 15 min)
const limiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Muitas requisições deste IP, tente novamente mais tarde.',
});
exports.app.use(limiter);
// Rotas
exports.app.use('/auth', auth_routes_1.authenticateRoutes);
exports.app.use('/transactions', transactions_routes_1.transactionsRoutes);
exports.app.use('/dashboard', dashboard_routes_1.dashboardRoutes);
exports.app.use('/credit-cards', credit_cards_routes_1.creditCardsRoutes);
exports.app.use('/recurring-transactions', recurring_transactions_routes_1.recurringTransactionsRoutes);
exports.app.use('/categories', categories_routes_1.categoriesRoutes);
exports.app.use('/goals', goals_routes_1.goalsRoutes);
exports.app.use('/workspaces', workspaces_routes_1.workspacesRoutes);
exports.app.use('/budgets', budgets_routes_1.budgetsRoutes);
exports.app.use('/cron', cron_routes_1.cronRoutes);
exports.app.use('/members', members_routes_1.membersRoutes);
exports.app.use('/users', users_routes_1.usersRoutes);
// Documentação Swagger
exports.app.use('/docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_output_json_1.default));
// Tratamento de Erros Global (Opcional, mas recomendado)
exports.app.use((err, req, res, next) => {
    if (err instanceof SyntaxError) {
        return res.status(400).json({ error: 'Invalid JSON' });
    }
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
});
