import { ZodError } from "zod";
export const errorHandler = (err, req, res, next) => {
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
};
//# sourceMappingURL=errorHandler.js.map