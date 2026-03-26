import type { Entity, CreateInput } from '../schemas/entity.schema.js';
export interface PlayerFilters {
    role?: string;
    minRating?: number;
}
export declare const getAll: (filters?: PlayerFilters) => Entity[];
export declare const getTopPlayers: () => Entity[];
export declare const getById: (id: string) => Entity | undefined;
export declare const create: (data: CreateInput) => Entity;
export declare const update: (id: string, data: Partial<CreateInput>) => Entity | null;
export declare const remove: (id: string) => boolean;
export declare const resetStorage: () => void;
//# sourceMappingURL=players.storage.d.ts.map