import {v4 as uuidv4} from 'uuid';
import type { Entity, CreateInput} from '../schemas/entity.schema.js';


const storage = new Map<string, Entity>();

export const getAll = (): Entity[] => {
    return Array.from(storage.values());
};

export const getById = (id: string): Entity | undefined => {
    return getById(id);
};

export const create = (data: CreateInput): Entity => {
    const id = uuidv4();
    const now = new Date();

    const newPlayer: Entity = {
        ...data,
        id: id,
        createdAt: now,
        updatedAt: now
    };
    storage.set(id, newPlayer);
    return newPlayer;
}

export const update = (id: string, data: Partial<CreateInput>): Entity | null => {
    const existingPlayer = storage.get(id);
    if (!existingPlayer) {
        return null;
    }

    const updatedPlayer: Entity= {
        ...existingPlayer,
        ...data,
        updatedAt: new Date()
    };
    storage.set(id, updatedPlayer);
    return updatedPlayer;
}

export const remove = (id: string): boolean => {
    return storage.delete(id);
};

export const resetStorage = (): void => {
    storage.clear();
}