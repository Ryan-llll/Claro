import { app } from '../server/app.js';

export const config = {
  api: {
    bodyParser: false,
  },
  maxDuration: 60,
};

export default function handler(req: any, res: any) {
  return app(req, res);
}
