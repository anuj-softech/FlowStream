import express, { Request, Response, Application } from 'express';
import cors from 'cors';
import { expressConnectMiddleware } from "@connectrpc/connect-express";
import routes from "./routes.js";

const app: Application = express();
const port: string | number = process.env.PORT || 3000;

app.use(cors({
  origin: (origin, callback) => {
    callback(null, true);
  },
  credentials: true
}));
app.use(express.json());

app.get('/health', (req: Request, res: Response): void => {
  res.json({ status: 'ok' });
});

app.use(expressConnectMiddleware({ routes }));

app.listen(port, (): void => {
  console.log(`Server is running on port ${port}`);
});
