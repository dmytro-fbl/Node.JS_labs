import request from "supertest";
import app from '../src/app.js';
import { resetStorage} from "../src/storage/players.storage.js";



const validPlayer = {
    nickname: "s1mple",
    rating: 1.25,
    role: "AWPer",
    description: "Легендарний гравець"
};

describe('API гравців (інтеграційний тест)', () => {
    beforeEach(() => {
        resetStorage();
    });
    describe('POST /players', () => {
        it('1. Повинен успішно створити гравця (статус 201)', async () => {
            const res = await request(app)
                .post('/players')
                .send(validPlayer)
                .expect(201);

            expect(res.body.nickname).toBe(validPlayer.nickname);
            expect(res.body.id).toBeDefined();
            expect(res.body.createdAt).toBeDefined();
        });

        it('2. Повинен повернути 400, якщо дані невалідні (немає нікнейму)', async () => {
            const invalidPlayer = { rating: 1.5, role: "AWPer" };

            const res = await request(app)
                .post('/players')
                .send(invalidPlayer)
                .expect(400);

            expect(res.body.status).toBe("error");
            expect(res.body.details).toBeDefined();
        });

        it('3. Повинен повернути 400, якщо рейтинг виходить за межі', async () => {
            const invalidPlayer = { ...validPlayer, rating: 5.0 };

            await request(app)
                .post('/players')
                .send(invalidPlayer)
                .expect(400);
        });
    });

    describe('GET /players', () => {
        it('4. Повинен повернути порожній масив, якщо бази немає', async () => {
            const res = await request(app).get('/players').expect(200);
            expect(res.body).toEqual([]);
        });

        it('5. Повинен повернути список створених гравців', async () => {

            await request(app).post('/players').send(validPlayer);

            const res = await request(app).get('/players').expect(200);
            expect(res.body.length).toBe(1);
            expect(res.body[0].nickname).toBe("s1mple");
        });

        it('6. Повинен правильно фільтрувати гравців за role (Завдання 3.7)', async () => {

            await request(app).post('/players').send(validPlayer).expect(201);


            const karriganResponse = await request(app)
                .post('/players')
                .send({ nickname: "karrigan", rating: 1.5, role: "IGL", description: "Captain of FaZe Clan"});

            expect(karriganResponse.status).toBe(201);


            const res = await request(app).get('/players?role=IGL').expect(200);

            expect(res.body.length).toBe(1);
            expect(res.body[0].nickname).toBe("karrigan");
        });
    });

    describe('GET /players/:id', () => {
        it('7. Повинен повернути гравця за правильним ID', async () => {
            const createRes = await request(app).post('/players').send(validPlayer);
            const createdId = createRes.body.id;

            const res = await request(app).get(`/players/${createdId}`).expect(200);
            expect(res.body.id).toBe(createdId);
        });

        it('8. Повинен повернути 404, якщо гравця не існує', async () => {
            await request(app).get('/players/fake-id-123').expect(404);
        });

        it('14. Повинен фільтрувати за minRating (другий параметр)', async () => {
            await request(app).post('/players').send({ nickname: "bot", rating: 1.0, role: "Rifler", description: "bot" }).expect(201);
            await request(app).post('/players').send({ nickname: "pro", rating: 2.0, role: "Rifler", description: "pro" }).expect(201);

            const res = await request(app).get('/players?minRating=1.5').expect(200);

            expect(res.body.length).toBe(1);
            expect(res.body[0].nickname).toBe("pro"); // Має знайти тільки pro
        });

        it('15. Повинен КОМБІНУВАТИ фільтри role та minRating', async () => {
            await request(app).post('/players').send({ nickname: "p1", rating: 2.0, role: "AWPer", description: "-" }).expect(201);
            await request(app).post('/players').send({ nickname: "p2", rating: 1.0, role: "AWPer", description: "-" }).expect(201);
            await request(app).post('/players').send({ nickname: "p3", rating: 2.0, role: "IGL", description: "-" }).expect(201);


            const res = await request(app).get('/players?role=AWPer&minRating=1.5').expect(200);

            expect(res.body.length).toBe(1);
            expect(res.body[0].nickname).toBe("p1");
        });
    });


    describe('PATCH /players/:id', () => {
        it('9. Повинен успішно оновити частину даних гравця', async () => {
            const createRes = await request(app).post('/players').send(validPlayer);
            const id = createRes.body.id;

            const res = await request(app)
                .patch(`/players/${id}`)
                .send({ rating: 1.30 })
                .expect(200);

            expect(res.body.rating).toBe(1.30);
            expect(res.body.nickname).toBe("s1mple");
        });

        it('10. Повинен повернути 404 при спробі оновити неіснуючого гравця', async () => {
            await request(app)
                .patch('/players/fake-id')
                .send({ rating: 2.0 })
                .expect(404);
        });

        it('11. Повинен повернути 400, якщо нові дані невалідні', async () => {
            const createRes = await request(app).post('/players').send(validPlayer);

            await request(app)
                .patch(`/players/${createRes.body.id}`)
                .send({ role: "Coach" })
                .expect(400);
        });
    });


    describe('DELETE /players/:id', () => {
        it('12. Повинен успішно видалити гравця (статус 204)', async () => {
            const createRes = await request(app).post('/players').send(validPlayer);
            const id = createRes.body.id;

            await request(app).delete(`/players/${id}`).expect(204);

            // Перевіряємо, що його дійсно більше немає
            await request(app).get(`/players/${id}`).expect(404);
        });

        it('13. Повинен повернути 404 при спробі видалити неіснуючого гравця', async () => {
            await request(app).delete('/players/fake-id').expect(404);
        });

    });

    describe('GET /players/top (Кастомний маршрут)', () => {
        it('16. Повинен повертати тільки топ-гравців (rating >= 1.2)', async () => {
            await request(app).post('/players').send({ nickname: "noob", rating: 1.0, role: "Rifler", description: "-" }).expect(201);
            await request(app).post('/players').send({ nickname: "god", rating: 2.0, role: "AWPer", description: "-" }).expect(201);

            const res = await request(app).get('/players/top').expect(200);

            expect(res.body.length).toBe(1);
            expect(res.body[0].nickname).toBe("god");
        });
    });
})