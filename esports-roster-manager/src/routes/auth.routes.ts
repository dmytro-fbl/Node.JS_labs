import {Router} from 'express';
import { z } from 'zod';
import { User } from '../models/User.js';
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';


const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_test_key';

const registerSchema = z.object({
    email: z.string().email({message: "Некоректний формат email "}),
    password: z.string().min(8, {message: "Пароль має містити не менше 8 символів"})
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string()
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

router.post('/login', async (req, res) => {
    try{
        const {email, password} = loginSchema.parse(req.body);

        const user = await User.findOne({email});
        if (!user) {
            return res.status(401).json({message: "Невірний email або пароль"});

        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Невірний email або пароль" });
        }

        const accessToken = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '30d' });

        res.cookie('access_token', accessToken, { httpOnly: true, secure: true, sameSite: 'strict' });
        res.cookie('refresh_token', refreshToken, { httpOnly: true, secure: true, sameSite: 'strict' });

        res.status(200).json({ message: "Успішний вхід" });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.issues });
        }
        res.status(500).json({ message: "Помилка сервера" });
    }
});

router.post('/refresh', (req, res) => {
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken) {
        return res.status(401).json({ message: "Немає токена" });
    }

    try {
        const decoded = jwt.verify(refreshToken, JWT_SECRET) as { userId: string };

        const newAccess = jwt.sign({ userId: decoded.userId }, JWT_SECRET, { expiresIn: '15m' });
        const newRefresh = jwt.sign({ userId: decoded.userId }, JWT_SECRET, { expiresIn: '30d' });

        res.cookie('access_token', newAccess, { httpOnly: true, secure: true, sameSite: 'strict' });
        res.cookie('refresh_token', newRefresh, { httpOnly: true, secure: true, sameSite: 'strict' });

        res.status(200).json({ message: "Токени оновлено" });
    } catch (error) {
        res.status(401).json({ message: "Недійсний токен" });
    }
});

router.post('/logout', (req, res) => {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    res.status(200).json({ message: "Вихід успішний" });
});

export default router;