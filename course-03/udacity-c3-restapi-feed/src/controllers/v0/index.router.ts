import { Router, Request, Response } from 'express';
import { FeedRouter } from './feed/routes/feed.router';
import cors from 'cors';

const router: Router = Router();

const options:cors.CorsOptions = {
    allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "X-Access-Token"],
    credentials: true,
    methods: "GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE",
    origin: ["http://localhost:8100","http://192.168.99.100:8100"],
    preflightContinue: false
  };
router.use(cors(options));

//add your routes

//enable pre-flight
router.options("*", cors(options));

router.use('/feed', FeedRouter);

router.get('/', async (req: Request, res: Response) => {    
    res.send(`V0`);
});

export const IndexRouter: Router = router;