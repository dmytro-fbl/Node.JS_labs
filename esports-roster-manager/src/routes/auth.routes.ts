import {Router} from 'express';
import { z } from 'zod';
import { User } from '../models/User.js';

const router = Router();

const registerSchema = z.object({
    email: z.string().email({message: "Некоректний формат email "}),
    password: z.string().min(8, {message: "Пароль має містити не менше 8 символів"})
});

router.post('/register', async (req, res) => {
    try{
        const {email, password} = registerSchema.parse(req.body);

        const existingUser = await User.findOne({email});
        if (existingUser) {
            return res.status(409).json({message: 'Користувач з такою поштою вже існує'});
        }

        const user = new User({ email, password });
        await user.save();

        const {password: _, ...userResponse } = user.toObject();

        res.status(201).json(userResponse);
    }catch(error: any){
        if(error instanceof z.ZodError){
            return res.status(400).json({errors: error.issues});
        }

        res.status(500).json({
            message: "Помилка сервера",
            details: error.message
        });
    }
});

export default router;