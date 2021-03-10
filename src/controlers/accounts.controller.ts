import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { orm } from '../orm';
import { Account  } from '../entities/account.entity';

export async function create(req: Request, res: Response) {
  const account = await Account.signup(req.body);
  res.status(201).json({
    token: jwt.sign(account.asJwt(), process.env!.JWT_SECRET!),
    clientId: account.clientId,
  });
}


// Non rest routes

export async function authenticate(req: Request, res: Response) {
  const account = await orm.em.findOne(Account, { email: req.body.email });
  if (account && (await account.isValidPassword(req.body.password))) {
    res.status(200).json({
      token: jwt.sign(account.asJwt(), process.env!.JWT_SECRET!),
      clientId: account.clientId,
    });
  } else {
    res.sendStatus(403);
  }
}
