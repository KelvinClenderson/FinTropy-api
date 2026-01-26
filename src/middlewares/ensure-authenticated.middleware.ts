import { NextFunction, Request, Response } from 'express';
import { verify } from 'jsonwebtoken';

interface IPayload {
  sub: string;
}

export function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
  const authToken = req.headers.authorization;

  if (!authToken) {
    return res.status(401).json({ error: 'Token não fornecido.' });
  }

  const [, token] = authToken.split(' ');

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('Erro de configuração: JWT_SECRET ausente.');
    }

    const { sub } = verify(token, process.env.JWT_SECRET) as IPayload;

    // CORREÇÃO AQUI: Preencher o objeto user conforme a tipagem
    req.user = {
      id: sub,
    };

    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
}
