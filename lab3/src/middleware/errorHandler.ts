import {ZodError} from "zod";
import type {Request, Response, NextFunction} from "express";

export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
)=> {
    if (err instanceof ZodError) {
        res.status(400).json({
            status: "error",
            message: "Дані не пройшли перевірку (помилка валідації)",
            details: err.issues
        });
        return;
    }

    console.error("непередбачена помилка на сервері", err);

    res.status(500).json({
        status: "error",
        message: "внутрішня помилка сервера!"
    });
}