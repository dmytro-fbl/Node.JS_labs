import request from "supertest";
import { MongoMemoryServer} from "mongodb-memory-server";
import mongoose from "mongoose";
import { jest } from '@jest/globals';
import app from '../src/app.js';
import { User} from "../src/models/User.js";

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();

    await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
})

beforeEach(async () => {
    await User.deleteMany({});
});

describe('POST /auth/register', () => {
    it('register success', async () => {
        const res = await request(app)
        .post("/auth/register")
        .send({email: 'test@gmail.com', password: 'password123'});
        expect(res.status).toBe(201);
        expect(res.body.email).toBe('test@gmail.com');
        expect(res.body.password).toBeUndefined();
    });
    it('register duplicate 409', async () => {
        await User.create({ email: 'duplicate@gmail.com', password: 'password123' });

        const res = await request(app)
            .post('/auth/register')
            .send({ email: 'duplicate@gmail.com', password: 'password123' });

        expect(res.status).toBe(409);
    });

    it('register invalid data 400', async () => {
        const res = await request(app)
            .post('/auth/register')
            .send({ email: 'not-an-email', password: '123' });

        expect(res.status).toBe(400);
        expect(res.body.errors).toBeDefined();
    });
    it('register generic server error 500', async () => {
        const spy = jest.spyOn(User, 'findOne').mockRejectedValue(new Error('Тестова помилка БД'));

        const res = await request(app)
            .post('/auth/register')
            .send({ email: 'error@test.com', password: 'password123' });

        expect(res.status).toBe(500);
        expect(res.body.message).toBe("Помилка сервера");
        expect(res.body.details).toBe("Тестова помилка БД");

        spy.mockRestore();
    });
});
