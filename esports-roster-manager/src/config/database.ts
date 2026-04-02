import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
    const uri = process.env.MONGODB_URI;

    if(!uri) {
        console.error('MongoDB URI not found');
        process.exit(1);
    }

    mongoose.connection.on('error', (err) => {
        console.error('помилка з\'єднання з Mongoose: ', err);
    });

    mongoose.connection.on('disconnected', (_err) => {
        console.warn('Mongoose відключивсь від бази даних');
    });

    await mongoose.connect(uri);
    console.log('Успішно підключено MongoDB');
}