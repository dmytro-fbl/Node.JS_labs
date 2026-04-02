import 'dotenv/config';
import mongoose from "mongoose";
import app from './app.js';
import { connectDB } from './config/database.js'

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try{
        await connectDB();

        const server = app.listen(PORT, () => {
            console.log(` Сервер запущено на порту ${PORT}`);
        });

        process.on('SIGINT', async () => {
            server.close(async () => {
                await mongoose.connection.close();
                console.log('База закрита');
                process.exit(0);
            });
        });
    }catch(error){
        console.error('Помилка при запуску', error);
        process.exit(1);
    }
};

startServer();
