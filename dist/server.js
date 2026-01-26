"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
require("./config/env"); // Carregar variáveis de ambiente
const jobs_1 = require("./jobs");
const PORT = process.env.PORT || 3333;
// Inicia os Cron Jobs
(0, jobs_1.startCronJobs)();
app_1.app.listen(PORT, () => {
    console.log(`🚀 HTTP Server running on port ${PORT}`);
});
