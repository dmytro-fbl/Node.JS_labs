import express from "express";
import playersRoutes from './routes/players.routes.js';
import { errorHandler } from "./middleware/errorHandler.js";
const app = express();
app.use(express.json());
app.use('/players', playersRoutes);
app.use(errorHandler);
export default app;
//# sourceMappingURL=app.js.map