import {type NextFunction, type Response, type Request, Router} from 'express';
import * as storage from '../storage/players.storage.js'
import {createSchema, updateSchema} from "../schemas/entity.schema.js";
import { validate } from '../middleware/validate.js';


const router = Router();

router.get('/top', async(req, res, next) => {
    try{
        const topPlayers = await storage.getTopPlayers();
        res.json(topPlayers);
    }catch(error){
        res.status(500).json({ message: 'Помилка при отримані топ гравців' });
        next(error);
    }
});

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try{
        const filters: storage.PlayerFilters = {};

        if (typeof req.query.role === 'string') {
            filters.role = req.query.role;
        }

        if (typeof req.query.minRating === 'string') {
            const parsedRating = parseFloat(req.query.minRating);
            if (!isNaN(parsedRating)) {
                filters.minRating = parsedRating;
            }
        }

        if(typeof req.query.sort === 'string') {
            filters.sort = req.query.sort;
        }

        if(typeof req.query.page === 'string') {
            const parsedPage = parseInt(req.query.page, 10);
            if (!isNaN(parsedPage) && parsedPage > 0) {
                filters.page = parsedPage;
            }
        }

        if (typeof req.query.limit === 'string') {
            const parsedLimit = parseInt(req.query.limit, 10);
            if (!isNaN(parsedLimit) && parsedLimit > 0) {
                filters.limit = parsedLimit;
            }
        }

        const result = await storage.getAll(filters);
        res.json(result);
    }catch(error){
        next(error);
    }
});

router.get('/:id', async (req, res, next) =>{
    try{
        const player = await storage.getById(req.params.id);

        if(!player){
            await res.status(404).json({message: 'Гравця не знайдено'});
            return;
        }
        res.json(player);
    }catch(error){
        next(error);
    }
});

router.post('/', validate(createSchema), async (req, res, next) => {
    try{
        const newPlayer = await storage.create(req.body);
        res.status(201).json(newPlayer);
    }catch(error){
        const err = error as Error;
        next(error);
    }
});

router.patch('/:id', validate(updateSchema), async (req, res, next) => {
    try{
        const updatedPlayer = await storage.update(req.params.id as string, req.body);

        if(!updatedPlayer){
            res.status(404).json({message: "Гравця для оновлення не знайдено"});
            return;
        }
        res.json(updatedPlayer);
    }catch(error){
        const err = error as Error;
        // res.status(400).json({ message: 'Помилка оновлення', error: err.message });
        next(error);
    }
});

router.delete('/:id', async (req, res, next) => {
    try{
        const isDeleted = await storage.remove(req.params.id);

        if(!isDeleted){
            res.status(404).json({message: "Гравця для видалення не знайдено"});
            return;
        }
        res.status(204).send();
    }catch(error){
        // res.status(400).json({ message: 'Помилка при видаленні (можливо невірний ID)' });
        next(error);
    }
})

export default router;