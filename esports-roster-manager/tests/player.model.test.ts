import { connect, close, clear } from "./setup.js";
import Player from "../src/models/player.model.js";

describe('Player Model Unit Tests', () => {
    beforeAll(async () => await connect());
    afterAll(async () => await close());
    afterEach(async () => await clear());

    it('має створювати гравця з рейтингом 1 за замовчуванням', async () => {
        const player = await Player.create({ nickname: 'NoRating', role: 'Rifler', "description": "test" });
        expect(player.rating).toBe(1);
    });

    it('має повертати помилку валідації, якщо в нікнеймі є пробіл', async () => {
        const player = new Player({ nickname: 'Invalid Name', role: 'AWPer', "description": "test"  });
        let error: any;
        try {
            await player.validate();
        } catch (e) {
            error = e;
        }
        expect(error.errors.nickname).toBeDefined();
        expect(error.errors.nickname.message).toContain('не повинен містити пробілів');
    });

    it('має коректно працювати віртуальне поле displaySummary', async () => {
        const player = new Player({ nickname: 's1mple', role: 'AWPer', rating: 1.5, "description": "test"});
        expect(player.displaySummary).toBe('s1mple [AWPer] - Rating: 1.5');
    });
});