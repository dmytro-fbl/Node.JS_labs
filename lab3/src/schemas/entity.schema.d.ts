import { z } from 'zod';
export declare const createSchema: z.ZodObject<{
    nickname: z.ZodString;
    description: z.ZodString;
    rating: z.ZodNumber;
    role: z.ZodEnum<{
        IGL: "IGL";
        AWPer: "AWPer";
        "Entry Fragger": "Entry Fragger";
        Support: "Support";
        Rifler: "Rifler";
    }>;
}, z.core.$strip>;
export declare const updateSchema: z.ZodObject<{
    nickname: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    rating: z.ZodOptional<z.ZodNumber>;
    role: z.ZodOptional<z.ZodEnum<{
        IGL: "IGL";
        AWPer: "AWPer";
        "Entry Fragger": "Entry Fragger";
        Support: "Support";
        Rifler: "Rifler";
    }>>;
}, z.core.$strip>;
export type CreateInput = z.infer<typeof createSchema>;
export type Entity = CreateInput & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
};
//# sourceMappingURL=entity.schema.d.ts.map