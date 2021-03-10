import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Account } from './entities/account.entity';
import { UnauthorizedError } from './errors';
import { JwtAccount, JwtUser } from './types';
import { orm } from './orm';



export async function isAccountLoggedIn(
  req: Request,
  _res: Response,
  next: any
) {
  await _isAccountLoggedIn(req);
  next();
}

async function _isAccountLoggedIn(req: Request): Promise<void> {
  let dbAccount: Account | null = null;
  const account: JwtUser | JwtAccount = await _getAuthedJwt(req);

  if (account.accountType === 'account') {
    dbAccount = await orm.em.findOne(Account, { id: account.id });
  }
  if (!dbAccount) {
    throw new UnauthorizedError();
  }
  req.account = dbAccount as Account;
}

function _getAuthedJwt(req: Request): Promise<JwtUser | JwtAccount> {
  return new Promise((resolve, reject) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      jwt.verify(
        token,
        process.env!.JWT_SECRET!,
        async (err: any, user: any) => {
          if (!err) {
            return resolve(user);
          }
          return reject(new UnauthorizedError());
        }
      );
    } else {
      return reject(new UnauthorizedError());
    }
  });
}
