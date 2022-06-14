import express, { Request, Response } from 'express';
import cors, { CorsOptions } from 'cors';
import RitoWrapper from './ritoWrapper';
import { Constants } from 'twisted';

export default function ExpressSetup() {
    
    const app = express();
    const rito = new RitoWrapper(process.env.LOL_API_KEY);

    const opt: CorsOptions = {
        origin: 'http://localhost:3000',
        methods: ["GET", "POST"]
    }
    
    app.use('*', function(req, res, next) {
        //replace localhost:8080 to the ip address:port of your server
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Methods", "GET");
        res.header('Access-Control-Allow-Headers', 'application/json');
        res.header('Access-Control-Allow-Credentials', 'true');
        next(); 
        });
        
    //enable pre-flight
    app.options('*', cors());
    
    app.get('/', (req: Request, res: Response) => {
        res.send("hello");
    });
    
    app.get('/ongoing', async (req: Request, res: Response) => {
        if (!req.query.username) {
            res.send({error: "error"});
            return
        }
        const data = await rito.GetCurrentGameStats(req.query.username as string, Constants.Regions.EU_WEST);
        res.send(data);
    });
    
    return app;
}