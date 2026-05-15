import { type NextFunction, type Response, type Request, Router } from 'express';
import * as storage from '../storage/players.storage.js';
import { createSchema, updateSchema } from "../schemas/entity.schema.js";
import { validate } from '../middleware/validate.js';
import { requireAuth, type AuthRequest } from '../middleware/requireAuth.js';
import Player from '../models/player.model.js';

const router = Router();

router.get('/top', async(req, res, next) => {
    try {
        const topPlayers = await storage.getTopPlayers();
        res.json(topPlayers);
    } catch(error) {
        res.status(500).json({ message: 'Помилка при отримані топ гравців' });
        next(error);
    }
});

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const filters: storage.PlayerFilters = {};

        if (typeof req.query.role === 'string') filters.role = req.query.role;
        if (typeof req.query.minRating === 'string') filters.minRating = parseFloat(req.query.minRating);
        if (typeof req.query.sort === 'string') filters.sort = req.query.sort;
        if (typeof req.query.page === 'string') filters.page = parseInt(req.query.page, 10);
        if (typeof req.query.limit === 'string') filters.limit = parseInt(req.query.limit, 10);

        const result = await storage.getAll(filters);
        res.json(result);
    } catch(error) {
        next(error);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const player = await storage.getById(req.params.id as string);
        if (!player) {
            res.status(404).json({message: 'Гравця не знайдено'});
            return;
        }
        res.json(player);
    } catch(error) {
        next(error);
    }
});

router.post('/', requireAuth, validate(createSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authReq = req as AuthRequest;

        const newPlayer = new Player({
            ...authReq.body,
            ownerId: authReq.userId
        });
        await newPlayer.save();

        res.status(201).json(newPlayer);
    } catch(error) {
        next(error);
    }
});

router.patch('/:id', requireAuth, validate(updateSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authReq = req as AuthRequest;
        const player = await Player.findById(req.params.id as string);

        if (!player) {
            res.status(404).json({ message: "Гравця не знайдено" });
            return;
        }

        if (!player.ownerId || player.ownerId.toString() !== authReq.userId) {
            res.status(403).send();
            return;
        }

        Object.assign(player, authReq.body);
        const updated = await player.save();
        res.json(updated);
    } catch(error) {
        next(error);
    }
});

router.delete('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authReq = req as AuthRequest;
        const playerDoc = await Player.findById(req.params.id as string);

        if (!playerDoc) {
            res.status(404).json({message: "Гравця для видалення не знайдено"});
            return;
        }

        if (!playerDoc.ownerId || playerDoc.ownerId.toString() !== authReq.userId) {
            res.status(403).send();
            return;
        }

        await playerDoc.deleteOne();
        res.status(204).send();
    } catch(error) {
        next(error);
    }
});

export default router;