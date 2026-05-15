import express from "express";
import mongoose from "mongoose";

import playersRoutes from './routes/players.routes.js';
import authRoutes from "./routes/auth.routes.js";
import {errorHandler} from "./middleware/errorHandler.js";

const app = express();

app.use(express.json());

app.use('/health', (req, res) => {
    const isConnected = mongoose.connection.readyState === 1;
    if (isConnected) {
        res.status(200).json({ status: 'ok', database: 'connected'});
    }else{
        res.status(503).json({ status: 'error', database: 'disconnected' });
    }
});

app.use('/players', playersRoutes);
app.use('/auth', authRoutes);

app.use(errorHandler);

export default app;
