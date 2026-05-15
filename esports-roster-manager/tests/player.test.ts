import request from "supertest";
import app from '../src/app.js';
import Player from "../src/models/player.model.js";
import { connect, close, clear } from './setup.js';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';





describe('API гравців (Інтеграційні тести)', () => {
    let token: string;
    let userId: string;
    let otherToken: string;
    let otherUserId: string;

    const validPlayerData = {
        nickname: "s1mple",
        rating: 1.25,
        role: "AWPer",
        description: "Легендарний гравець"
    };

    beforeAll(async () => {
        await connect();

        userId = new mongoose.Types.ObjectId().toString();
        otherUserId = new mongoose.Types.ObjectId().toString();

        const secret = process.env.JWT_SECRET || 'test-secret';
        token = jwt.sign({ userId }, secret);
        otherToken = jwt.sign({ userId: otherUserId }, secret);
    });

    afterAll(async () => await close());
    afterEach(async () => await clear());

    describe('POST /players', () => {
        it('1. Повинен повернути 401 без токена', async () => {
            const res = await request(app)
                .post('/players')
                .send(validPlayerData)
                .expect(401);
            expect(res.text).toBe('');
        });

        it('2. Повинен успішно створити гравця (статус 201) та призначити ownerId', async () => {
            const res = await request(app)
                .post('/players')
                .set('Cookie', [`access_token=${token}`])
                .send(validPlayerData)
                .expect(201);

            expect(res.body.nickname).toBe(validPlayerData.nickname);
            expect(res.body.ownerId).toBe(userId);
        });

        it('3. Повинен повернути 400, якщо дані невалідні', async () => {
            const res = await request(app)
                .post('/players')
                .set('Cookie', [`access_token=${token}`])
                .send({ rating: 1.5, role: "AWPer", description: "test" })
                .expect(400);

            expect(res.body.message).toBeDefined();
        });
    });

    describe('GET /players (Пагінація, фільтри, сортування)', () => {
        it('4. Повинен повернути порожній список, якщо база порожня', async () => {
            const res = await request(app).get('/players').expect(200);
            expect(res.body.data).toEqual([]);
        });

        it('5. Повинен повернути список створених гравців у полі data', async () => {
            await request(app)
                .post('/players')
                .set('Cookie', [`access_token=${token}`])
                .send(validPlayerData);

            const res = await request(app).get('/players').expect(200);

            expect(res.body.data.length).toBe(1);
            expect(res.body.data[0].nickname).toBe("s1mple");
        });
    });

    describe('Оновлення та видалення (Авторизація)', () => {
        it('6. PATCH: повинен повернути 403, якщо змінює інший користувач', async () => {
            const createRes = await request(app)
                .post('/players')
                .set('Cookie', [`access_token=${token}`])
                .send(validPlayerData);
            const id = createRes.body._id;

            await request(app)
                .patch(`/players/${id}`)
                .set('Cookie', [`access_token=${otherToken}`])
                .send({ rating: 2.8 })
                .expect(403);
        });

        it('7. PATCH: має оновити гравця власником', async () => {
            const createRes = await request(app)
                .post('/players')
                .set('Cookie', [`access_token=${token}`])
                .send(validPlayerData);
            const id = createRes.body._id;

            const res = await request(app)
                .patch(`/players/${id}`)
                .set('Cookie', [`access_token=${token}`])
                .send({ rating: 2.8 })
                .expect(200);

            expect(res.body.rating).toBe(2.8);
        });

        it('8. DELETE: повинен повернути 403, якщо видаляє не власник', async () => {
            const createRes = await request(app)
                .post('/players')
                .set('Cookie', [`access_token=${token}`])
                .send(validPlayerData);
            const id = createRes.body._id;

            await request(app)
                .delete(`/players/${id}`)
                .set('Cookie', [`access_token=${otherToken}`])
                .expect(403);
        });

        it('9. DELETE: має видалити гравця власником', async () => {
            const createRes = await request(app)
                .post('/players')
                .set('Cookie', [`access_token=${token}`])
                .send(validPlayerData);
            const id = createRes.body._id;

            await request(app)
                .delete(`/players/${id}`)
                .set('Cookie', [`access_token=${token}`])
                .expect(204);

            await request(app).get(`/players/${id}`).expect(404);
        });
    });

    describe('GET /players/top', () => {
        it('має повертати список топ-гравців', async () => {
            await Player.create({ ...validPlayerData, nickname: 'TopPlayer', rating: 2.0, ownerId: userId });

            const res = await request(app).get('/players/top');

            expect(res.status).toBe(200);
            const data = res.body.data ? res.body.data : res.body;
            expect(Array.isArray(data)).toBe(true);
        });
    });

    describe('GET /players/:id', () => {
        it('має повертати гравця за його ID', async () => {
            const player = await Player.create({ ...validPlayerData, ownerId: userId });

            const res = await request(app).get(`/players/${player._id}`);

            expect(res.status).toBe(200);
            expect(res.body.nickname).toBe(validPlayerData.nickname);
        });

        it('має повертати 404, якщо гравця не існує', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app).get(`/players/${fakeId}`);
            expect(res.status).toBe(404);
        });
    });

    describe('POST /players', () => {
        it('має повернути 401, якщо користувач не авторизований', async () => {
            await request(app)
                .post('/players')
                .send(validPlayerData)
                .expect(401);
        });

        it('має успішно створити гравця та призначити поточного юзера як ownerId', async () => {
            const res = await request(app)
                .post('/players')
                .set('Cookie', [`access_token=${token}`])
                .send(validPlayerData);

            expect(res.status).toBe(201);
            expect(res.body.nickname).toBe(validPlayerData.nickname);
            expect(res.body.ownerId.toString()).toBe(userId);
        });
    });

    describe('DELETE /players/:id', () => {
        it('має видалити гравця, якщо запит робить власник', async () => {
            const player = await Player.create({ ...validPlayerData, ownerId: userId });

            await request(app)
                .delete(`/players/${player._id}`)
                .set('Cookie', [`access_token=${token}`])
                .expect(204);

            const check = await Player.findById(player._id);
            expect(check).toBeNull();
        });

        it('має повернути 403, якщо гравець намагається видалити чужий запис', async () => {
            const player = await Player.create({ ...validPlayerData, ownerId: userId });

            const res = await request(app)
                .delete(`/players/${player._id}`)
                .set('Cookie', [`access_token=${otherToken}`]);

            expect(res.status).toBe(403);

            const check = await Player.findById(player._id);
            expect(check).not.toBeNull();
        });

        it('має повернути 404, якщо гравця для видалення не знайдено', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            await request(app)
                .delete(`/players/${fakeId}`)
                .set('Cookie', [`access_token=${token}`])
                .expect(404);
        });
    });
});