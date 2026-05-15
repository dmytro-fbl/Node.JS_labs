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

describe('POST /auth/login & Tokens', () => {
    it('login fail 401 - wrong email', async () => {
        const res = await request(app).post('/auth/login').send({ email: 'wrong@test.com', password: 'password123' });
        expect(res.status).toBe(401);
    });

    it('login fail 401 - wrong password', async () => {
        await request(app).post('/auth/register').send({ email: 'login@test.com', password: 'password123' });
        const res = await request(app).post('/auth/login').send({ email: 'login@test.com', password: 'wrongpassword' });
        expect(res.status).toBe(401);
    });

    it('login success and get cookies', async () => {
        await request(app).post('/auth/register').send({ email: 'token@test.com', password: 'password123' });
        const res = await request(app).post('/auth/login').send({ email: 'token@test.com', password: 'password123' });

        expect(res.status).toBe(200);
        expect(res.headers['set-cookie']).toBeDefined();
        expect(res.headers['set-cookie']![0]).toMatch(/access_token=/);
        expect(res.headers['set-cookie']![1]).toMatch(/refresh_token=/);
    });

    it('refresh success', async () => {
        await request(app).post('/auth/register').send({ email: 'ref@test.com', password: 'password123' });
        const loginRes = await request(app).post('/auth/login').send({ email: 'ref@test.com', password: 'password123' });
        const cookies = loginRes.headers['set-cookie'] as unknown as string[];

        const res = await request(app).post('/auth/refresh').set('Cookie', cookies);
        expect(res.status).toBe(200);
        expect(res.headers['set-cookie']).toBeDefined();
    });

    it('refresh fail - no token', async () => {
        const res = await request(app).post('/auth/refresh');
        expect(res.status).toBe(401);
    });

    it('logout success', async () => {
        const res = await request(app).post('/auth/logout');
        expect(res.status).toBe(200);
        expect(res.headers['set-cookie']![0]).toMatch(/access_token=;/);
    });
    it('refresh fail 401 - invalid token', async () => {
        const res = await request(app)
            .post('/auth/refresh')
            .set('Cookie', ['refresh_token=fake_invalid_token_string_123']);

        expect(res.status).toBe(401);
        expect(res.body.message).toBe("Недійсний токен");
    });

    it('login fail 400 - validation error (Zod)', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({ email: 'not-an-email' });

        expect(res.status).toBe(400);
        expect(res.body.errors).toBeDefined();
    });

    it('login generic server error 500', async () => {
        const spy = jest.spyOn(User, 'findOne').mockRejectedValue(new Error('Тестова помилка БД при логіні'));

        const res = await request(app)
            .post('/auth/login')
            .send({ email: 'test@test.com', password: 'password123' });

        expect(res.status).toBe(500);
        expect(res.body.message).toBe("Помилка сервера");

        spy.mockRestore();
    });
});
