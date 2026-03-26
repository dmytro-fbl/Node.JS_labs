import { z } from 'zod';

export const createSchema = z.object({
    nickname: z.string().min(1).max(100),
    description: z.string().min(1).max(500),
    rating: z.number().min(1).max(3).multipleOf(0.01),
    role: z.enum(['IGL', 'AWPer', 'Entry Fragger', 'Support', 'Rifler'])
});

export const updateSchema = createSchema.partial();

export type CreateInput = z.infer<typeof createSchema>;

export type Entity = CreateInput &{
    id: string;
    createdAt: Date;
    updatedAt: Date;
}



