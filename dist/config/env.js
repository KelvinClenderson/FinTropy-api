"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const zod_1 = require("zod");
// Define o esquema das variáveis de ambiente
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['dev', 'test', 'production']).default('dev'),
    PORT: zod_1.z.coerce.number().default(3333),
    DATABASE_URL: zod_1.z.string().url(),
});
// Tenta validar process.env
const _env = envSchema.safeParse(process.env);
if (_env.success === false) {
    console.error('❌ Invalid environment variables', _env.error.format());
    // Encerra a aplicação com erro se a validação falhar
    throw new Error('Invalid environment variables.');
}
// Exporta as variáveis validadas e tipadas
exports.env = _env.data;
