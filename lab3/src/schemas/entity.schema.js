import { z } from 'zod';
export const createSchema = z.object({
    nickname: z.string().min(1).max(100),
    description: z.string().min(1).max(500),
    rating: z.number().min(1).max(3).multipleOf(0.01),
    role: z.enum(['IGL', 'AWPer', 'Entry Fragger', 'Support', 'Rifler'])
});
export const updateSchema = createSchema.partial();
//# sourceMappingURL=entity.schema.js.map