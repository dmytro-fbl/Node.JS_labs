import { v4 as uuidv4 } from 'uuid';
const storage = new Map();
export const getAll = (filters) => {
    let players = Array.from(storage.values());
    if (filters && filters.role) {
        players = players.filter(player => player.role === filters.role);
    }
    if (filters?.minRating !== undefined) {
        players = players.filter(player => player.rating >= filters.minRating);
    }
    return players;
};
export const getTopPlayers = () => {
    let players = Array.from(storage.values());
    return players.filter(player => player.rating >= 1.2);
};
export const getById = (id) => {
    return storage.get(id);
};
export const create = (data) => {
    const id = uuidv4();
    const now = new Date();
    const newPlayer = {
        ...data,
        id: id,
        createdAt: now,
        updatedAt: now
    };
    storage.set(id, newPlayer);
    return newPlayer;
};
export const update = (id, data) => {
    const existingPlayer = storage.get(id);
    if (!existingPlayer) {
        return null;
    }
    const updatedPlayer = {
        ...existingPlayer,
        ...data,
        updatedAt: new Date()
    };
    storage.set(id, updatedPlayer);
    return updatedPlayer;
};
export const remove = (id) => {
    return storage.delete(id);
};
export const resetStorage = () => {
    storage.clear();
};
//# sourceMappingURL=players.storage.js.map