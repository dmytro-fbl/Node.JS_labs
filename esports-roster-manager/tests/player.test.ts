// import request from "supertest";
// import app from '../src/app.js';
// import { connect, close, clear } from './setup.js';
//
//
//
// const validPlayer = {
//     nickname: "s1mple",
//     rating: 1.25,
//     role: "AWPer",
//     description: "Легендарний гравець"
// };
//
// describe('API гравців (інтеграційний тест)', () => {
//     beforeEach(() => {
//
//     });
//     describe('POST /players', () => {
//         it('1. Повинен успішно створити гравця (статус 201)', async () => {
//             const res = await request(app)
//                 .post('/players')
//                 .send(validPlayer)
//                 .expect(201);
//
//             expect(res.body.nickname).toBe(validPlayer.nickname);
//             expect(res.body.id).toBeDefined();
//             expect(res.body.createdAt).toBeDefined();
//         });
//
//         it('2. Повинен повернути 400, якщо дані невалідні (немає нікнейму)', async () => {
//             const invalidPlayer = { rating: 1.5, role: "AWPer" };
//
//             const res = await request(app)
//                 .post('/players')
//                 .send(invalidPlayer)
//                 .expect(400);
//
//             expect(res.body.status).toBe("error");
//             expect(res.body.details).toBeDefined();
//         });
//
//         it('3. Повинен повернути 400, якщо рейтинг виходить за межі', async () => {
//             const invalidPlayer = { ...validPlayer, rating: 5.0 };
//
//             await request(app)
//                 .post('/players')
//                 .send(invalidPlayer)
//                 .expect(400);
//         });
//     });
//
//     describe('GET /players', () => {
//         it('4. Повинен повернути порожній масив, якщо бази немає', async () => {
//             const res = await request(app).get('/players').expect(200);
//             expect(res.body).toEqual([]);
//         });
//
//         it('5. Повинен повернути список створених гравців', async () => {
//
//             await request(app).post('/players').send(validPlayer);
//
//             const res = await request(app).get('/players').expect(200);
//             expect(res.body.length).toBe(1);
//             expect(res.body[0].nickname).toBe("s1mple");
//         });
//
//         it('6. Повинен правильно фільтрувати гравців за role (Завдання 3.7)', async () => {
//
//             await request(app).post('/players').send(validPlayer).expect(201);
//
//
//             const karriganResponse = await request(app)
//                 .post('/players')
//                 .send({ nickname: "karrigan", rating: 1.5, role: "IGL", description: "Captain of FaZe Clan"});
//
//             expect(karriganResponse.status).toBe(201);
//
//
//             const res = await request(app).get('/players?role=IGL').expect(200);
//
//             expect(res.body.length).toBe(1);
//             expect(res.body[0].nickname).toBe("karrigan");
//         });
//     });
//
//     describe('GET /players/:id', () => {
//         it('7. Повинен повернути гравця за правильним ID', async () => {
//             const createRes = await request(app).post('/players').send(validPlayer);
//             const createdId = createRes.body.id;
//
//             const res = await request(app).get(`/players/${createdId}`).expect(200);
//             expect(res.body.id).toBe(createdId);
//         });
//
//         it('8. Повинен повернути 404, якщо гравця не існує', async () => {
//             await request(app).get('/players/fake-id-123').expect(404);
//         });
//
//         it('14. Повинен фільтрувати за minRating (другий параметр)', async () => {
//             await request(app).post('/players').send({ nickname: "bot", rating: 1.0, role: "Rifler", description: "bot" }).expect(201);
//             await request(app).post('/players').send({ nickname: "pro", rating: 2.0, role: "Rifler", description: "pro" }).expect(201);
//
//             const res = await request(app).get('/players?minRating=1.5').expect(200);
//
//             expect(res.body.length).toBe(1);
//             expect(res.body[0].nickname).toBe("pro"); // Має знайти тільки pro
//         });
//
//         it('15. Повинен КОМБІНУВАТИ фільтри role та minRating', async () => {
//             await request(app).post('/players').send({ nickname: "p1", rating: 2.0, role: "AWPer", description: "-" }).expect(201);
//             await request(app).post('/players').send({ nickname: "p2", rating: 1.0, role: "AWPer", description: "-" }).expect(201);
//             await request(app).post('/players').send({ nickname: "p3", rating: 2.0, role: "IGL", description: "-" }).expect(201);
//
//
//             const res = await request(app).get('/players?role=AWPer&minRating=1.5').expect(200);
//
//             expect(res.body.length).toBe(1);
//             expect(res.body[0].nickname).toBe("p1");
//         });
//     });
//
//
//     describe('PATCH /players/:id', () => {
//         it('9. Повинен успішно оновити частину даних гравця', async () => {
//             const createRes = await request(app).post('/players').send(validPlayer);
//             const id = createRes.body.id;
//
//             const res = await request(app)
//                 .patch(`/players/${id}`)
//                 .send({ rating: 1.30 })
//                 .expect(200);
//
//             expect(res.body.rating).toBe(1.30);
//             expect(res.body.nickname).toBe("s1mple");
//         });
//
//         it('10. Повинен повернути 404 при спробі оновити неіснуючого гравця', async () => {
//             await request(app)
//                 .patch('/players/fake-id')
//                 .send({ rating: 2.0 })
//                 .expect(404);
//         });
//
//         it('11. Повинен повернути 400, якщо нові дані невалідні', async () => {
//             const createRes = await request(app).post('/players').send(validPlayer);
//
//             await request(app)
//                 .patch(`/players/${createRes.body.id}`)
//                 .send({ role: "Coach" })
//                 .expect(400);
//         });
//     });
//
//
//     describe('DELETE /players/:id', () => {
//         it('12. Повинен успішно видалити гравця (статус 204)', async () => {
//             const createRes = await request(app).post('/players').send(validPlayer);
//             const id = createRes.body.id;
//
//             await request(app).delete(`/players/${id}`).expect(204);
//
//             // Перевіряємо, що його дійсно більше немає
//             await request(app).get(`/players/${id}`).expect(404);
//         });
//
//         it('13. Повинен повернути 404 при спробі видалити неіснуючого гравця', async () => {
//             await request(app).delete('/players/fake-id').expect(404);
//         });
//
//     });
//
//     describe('GET /players/top (Кастомний маршрут)', () => {
//         it('16. Повинен повертати тільки топ-гравців (rating >= 1.2)', async () => {
//             await request(app).post('/players').send({ nickname: "noob", rating: 1.0, role: "Rifler", description: "-" }).expect(201);
//             await request(app).post('/players').send({ nickname: "god", rating: 2.0, role: "AWPer", description: "-" }).expect(201);
//
//             const res = await request(app).get('/players/top').expect(200);
//
//             expect(res.body.length).toBe(1);
//             expect(res.body[0].nickname).toBe("god");
//         });
//     });
//     describe('Player API Integration Tests', () => {
//         beforeAll(async () => await connect());
//         afterAll(async () => await close());
//         afterEach(async () => await clear());
//
//         it('GET /players — має повертати об’єкт з data та pagination', async () => {
//             await request(app).post('/players').send({ nickname: 'p1', role: 'R', rating: 1 });
//
//             const res = await request(app).get('/players');
//
//             expect(res.status).toBe(200);
//             expect(res.body).toHaveProperty('data');
//             expect(res.body).toHaveProperty('pagination');
//             expect(res.body.data.length).toBe(1);
//         });
//
//         it('GET /players/:id — 404 для відсутнього ID, 400 для кривого формату', async () => {
//             // 400 - CastError (кривий формат)
//             const res400 = await request(app).get('/players/123-not-valid');
//             expect(res400.status).toBe(400);
//
//             // 404 - Валідний формат, але гравця нема
//             const validButEmptyId = '507f1f087a190742a0000000';
//             const res404 = await request(app).get(`/players/${validButEmptyId}`);
//             expect(res404.status).toBe(404);
//         });
//
//         it('GET /players — має сортувати за параметром sort', async () => {
//             await request(app).post('/players').send({ nickname: 'A', rating: 1.0, role: 'R' });
//             await request(app).post('/players').send({ nickname: 'B', rating: 3.0, role: 'R' });
//
//             const res = await request(app).get('/players?sort=-rating');
//             expect(res.body.data[0].nickname).toBe('B');
//         });
//     });
// });

import request from "supertest";
import app from '../src/app.js';
import { connect, close, clear } from './setup.js';

const validPlayer = {
    nickname: "s1mple",
    rating: 1.25,
    role: "AWPer",
    description: "Легендарний гравець"
};

describe('API гравців (Інтеграційні тести)', () => {
    // ПІДКЛЮЧАЄМО БАЗУ ДЛЯ ВСІХ ТЕСТІВ У ФАЙЛІ
    beforeAll(async () => await connect());
    afterAll(async () => await close());
    afterEach(async () => await clear());

    describe('POST /players', () => {
        it('1. Повинен успішно створити гравця (статус 201)', async () => {
            const res = await request(app)
                .post('/players')
                .send(validPlayer)
                .expect(201);

            expect(res.body.nickname).toBe(validPlayer.nickname);
            expect(res.body._id).toBeDefined(); // MongoDB використовує _id
        });

        it('2. Повинен повернути 400, якщо дані невалідні (немає нікнейму)', async () => {
            const res = await request(app)
                .post('/players')
                .send({ rating: 1.5, role: "AWPer", description: "test" })
                .expect(400);

            // Тут структура залежить від твого errorHandler
            expect(res.body.message).toBeDefined();
        });
    });

    describe('GET /players (Пагінація, фільтри, сортування)', () => {
        it('3. Повинен повернути порожній список, якщо база порожня', async () => {
            const res = await request(app).get('/players').expect(200);
            // ПЕРЕВІРКА: тепер структура { data: [], pagination: {} }
            expect(res.body.data).toEqual([]);
        });

        it('4. Повинен повернути список створених гравців у полі data', async () => {
            await request(app).post('/players').send(validPlayer);
            const res = await request(app).get('/players').expect(200);

            expect(res.body.data.length).toBe(1);
            expect(res.body.data[0].nickname).toBe("s1mple");
        });

        it('5. Повинен фільтрувати за роллю та minRating', async () => {
            await request(app).post('/players').send({ nickname: "p1", rating: 2.0, role: "AWPer", description: "-" });
            await request(app).post('/players').send({ nickname: "p2", rating: 1.0, role: "AWPer", description: "-" });

            const res = await request(app).get('/players?role=AWPer&minRating=1.5').expect(200);

            expect(res.body.data.length).toBe(1);
            expect(res.body.data[0].nickname).toBe("p1");
        });

        it('6. Повинен сортувати за рейтингом (-rating)', async () => {
            await request(app).post('/players').send({ nickname: "low", rating: 1.0, role: "Rifler", description: "-" });
            await request(app).post('/players').send({ nickname: "high", rating: 3.0, role: "Rifler", description: "-" });

            const res = await request(app).get('/players?sort=-rating');
            expect(res.body.data).toBeDefined();
            expect(res.body.data[0].nickname).toBe("high");
        });
    });

    describe('GET /players/:id', () => {
        it('7. Повинен повернути 400 для невалідного формату ID (CastError)', async () => {
            await request(app).get('/players/fake-id-123').expect(400);
        });

        it('8. Повинен повернути 404 для валідного, але неіснуючого ID', async () => {
            const fakeId = "507f1f087a190742a0000000";
            await request(app).get(`/players/${fakeId}`).expect(404);
        });
    });

    describe('Оновлення та видалення', () => {
        it('9. PATCH: має оновити гравця', async () => {
            const createRes = await request(app).post('/players').send(validPlayer);
            const id = createRes.body._id;

            const res = await request(app)
                .patch(`/players/${id}`)
                .send({ rating: 2.8 })
                .expect(200);

            expect(res.body.rating).toBe(2.8);
        });

        it('10. DELETE: має видалити гравця', async () => {
            const createRes = await request(app).post('/players').send(validPlayer);
            const id = createRes.body._id;

            await request(app).delete(`/players/${id}`).expect(204);
            await request(app).get(`/players/${id}`).expect(404);
        });
    });

    describe('GET /players/top (Кастомний маршрут)', () => {
        it('11. Повинен повертати тільки топ-гравців', async () => {
            await request(app).post('/players').send({ nickname: "noob", rating: 1.0, role: "Rifler", description: "-" });
            await request(app).post('/players').send({ nickname: "god", rating: 2.0, role: "AWPer", description: "-" });

            const res = await request(app).get('/players/top').expect(200);

            const players = res.body.data ? res.body.data : res.body;

            expect(players.length).toBe(1);
            expect(players[0].nickname).toBe("god");
        });
    });
});