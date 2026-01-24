import { NextFunction, Request, Response } from 'express';
import { verify } from 'jsonwebtoken';

interface IPayload {
  sub: string; // O 'sub' no JWT geralmente guarda o ID do usuário
}

export function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
  // 1. Receber o token
  const authToken = req.headers.authorization;

  // 2. Validar se o token está preenchido
  if (!authToken) {
    return res.status(401).json({ error: 'Token não fornecido.' });
  }

  // O token vem no formato "Bearer 12345abcdef...", precisamos tirar o "Bearer "
  const [, token] = authToken.split(' ');

  try {
    // 3. Validar o token
    if (!process.env.JWT_SECRET) {
      throw new Error('Erro de configuração: JWT_SECRET ausente.');
    }

    const { sub } = verify(token, process.env.JWT_SECRET) as IPayload;

    // 4. Recuperar informações do usuário e colocar na requisição
    // Para isso funcionar no TypeScript, precisaremos estender a tipagem do Express (veremos isso a seguir)
    req.user_id = sub;

    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
}
