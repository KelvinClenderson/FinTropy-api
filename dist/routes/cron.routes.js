"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cronRoutes = void 0;
const express_1 = require("express");
const trigger_cron_controller_1 = require("../controllers/cron/trigger-cron.controller");
const cronRoutes = (0, express_1.Router)();
exports.cronRoutes = cronRoutes;
const triggerController = new trigger_cron_controller_1.TriggerCronController();
// POST /cron/process-recurring
// Recomendado proteger esta rota ou deixar pública apenas se usar um Header Secret
cronRoutes.post('/process-recurring', triggerController.handle);
