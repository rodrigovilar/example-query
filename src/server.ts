require('rootpath')();
require(`express-async-errors`);
import helmet from 'helmet';
import express, { Response } from 'express';
import bodyParser from 'body-parser';

import routes from './routes';
import { initOrm } from './orm';
import { RequestContext } from '@mikro-orm/core';

const app = express();
const port = process.env.PORT || 3000;
(async () => {
  const orm = await initOrm();
  app.enable("trust proxy");
  app.use(helmet());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use((_req, _res, next) => {
    RequestContext.create(orm.em, next);
  });
  routes(app);
  app.get('/', (_req, res: Response) => {
    res.status(200).send('Welcome to Example API');
  });
  app.listen(port, () => console.log(`Example API listening on port ${port}!`));
})();
