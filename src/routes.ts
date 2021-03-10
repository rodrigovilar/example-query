import { Express } from 'express';
import express from 'express';

import * as accountController from './controlers/accounts.controller';
import * as segmentController from './controlers/segments.controller';
import { isAccountLoggedIn } from './auth';


export default (app: Express) => {
    const accountRouter = express.Router();
    accountRouter.post('/', accountController.create);
    app.use(`/api/accounts`, accountRouter);

    const segmentRouter = express.Router({ mergeParams: true });
    segmentRouter.get('/', segmentController.index);
    app.use(`/api/segments`, isAccountLoggedIn, segmentRouter);
};
