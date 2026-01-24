import { z } from 'zod';

// Define o esquema das variáveis de ambiente
const envSchema = z.object({
  NODE_ENV: z.enum(['dev', 'test', 'production']).default('dev'),
  PORT: z.coerce.number().default(3333),
  DATABASE_URL: z.string().url(),
});

// Tenta validar process.env
const _env = envSchema.safeParse(process.env);

if (_env.success === false) {
  console.error('❌ Invalid environment variables', _env.error.format());

  // Encerra a aplicação com erro se a validação falhar
  throw new Error('Invalid environment variables.');
}

// Exporta as variáveis validadas e tipadas
export const env = _env.data;
