import {ZodError} from "zod";
import type {Request, Response, NextFunction} from "express";

export const errorHandler = (
    err: any,
    _req: Request,
    res: Response,
    _next: NextFunction
)=> {
    if (err instanceof ZodError) {
        res.status(400).json({
            status: "error",
            message: "Дані не пройшли перевірку (помилка валідації)",
            details: err.issues
        });
        return;
    }
    if(err.name === 'CastError' && err.kind === 'ObjectId') {
        res.status(400).json({
            message: 'Неправильний формат ID. ID має бути валідним'
        });
    }

    if(err.name === "ValidationError") {
        const messages = Object.values(err.errors).map((val: any) => val.message);
        return res.status(400).json({
            message: 'Помилка валідації бази даних',
            error: messages
        });
    }

    if (err.code === 11000) {
        return res.status(400).json({
            message: 'Запис з такими унікальними даними вже існує'
        });
    }


    console.error("непередбачена помилка на сервері", err);

    res.status(500).json({
        status: "error",
        message: "внутрішня помилка сервера!"
    });
}