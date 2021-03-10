import { Segment } from '../entities/segment.entity';
import { Request, Response } from 'express';
import { orm } from '../orm';

export async function index(req: Request, res: Response) {
  const segments = await orm.em.find(Segment, {
    owner: req.account,
  });
  if (req.query.withCount === 'true') {
    for (const segment of segments) {
      segment.count = await segment.countSubscribers();
    }
  }
  if (req.query.withSubscribers === 'true') {
    for (const segment of segments) {
      segment.subscribers = await segment.getSubscribers();
    }
  }

  res.status(200).json({ segments });
}
