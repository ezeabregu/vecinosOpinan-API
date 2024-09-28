import express, { Express } from "express";
import { dbConnection } from "../database/config";
import cors from "cors";

export class Server {
  app: Express;
  port: string | number | undefined;

  constructor() {
    this.app = express();
    this.port = process.env.PORT;
    this.conectarDB();
    this.middlewares();
    this.routes();
  }
  async conectarDB(): Promise<void> {
    await dbConnection();
  }
  middlewares(): void {
    this.app.use(express.json());
    this.app.use(cors());
  }
  routes(): void {}
  listen(): void {
    this.app.listen(this.port, () => {
      console.log(`Corriendo en puerto ${this.port}`);
    });
  }
}
