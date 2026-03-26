import { Router } from 'express';
import * as storage from '../storage/players.storage.js';
import { createSchema, updateSchema } from "../schemas/entity.schema.js";
import { validate } from '../middleware/validate.js';
const router = Router();
router.get('/top', (req, res) => {
    const topPlayers = storage.getTopPlayers();
    res.json(topPlayers);
});
router.get('/', (req, res) => {
    const filters = {};
    if (typeof req.query.role === 'string') {
        filters.role = req.query.role;
    }
    if (typeof req.query.minRating === 'string') {
        const parsedRating = parseFloat(req.query.minRating);
        if (!isNaN(parsedRating)) {
            filters.minRating = parsedRating;
        }
    }
    const players = storage.getAll(filters);
    res.json(players);
});
router.get('/:id', (req, res) => {
    const player = storage.getById(req.params.id);
    if (!player) {
        res.status(404).json({ message: 'Гравця не знайдено' });
        return;
    }
    res.json(player);
});
router.post('/', validate(createSchema), (req, res) => {
    const newPlayer = storage.create(req.body);
    res.status(201).json(newPlayer);
});
router.patch('/:id', validate(updateSchema), (req, res) => {
    const updatedPlayer = storage.update(req.params.id, req.body);
    if (!updatedPlayer) {
        res.status(404).json({ message: "Гравця для оновлення не знайдено" });
        return;
    }
    res.json(updatedPlayer);
});
router.delete('/:id', (req, res) => {
    const isDeleted = storage.remove(req.params.id);
    if (!isDeleted) {
        res.status(404).json({ message: "Гравця для видалення не знайдено" });
        return;
    }
    res.status(204).send();
});
export default router;
//# sourceMappingURL=players.routes.js.map