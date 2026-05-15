import Player from "../models/player.model.js";
import type {IPlayer} from "../models/player.model.js";
import type { CreateInput } from '../schemas/entity.schema.js';

export interface PlayerFilters {
    role?: string;
    minRating?: number;
    sort?: string;
    page?: number;
    limit?: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPage: number;
    };
}

export const getAll = async (filters: PlayerFilters = {}): Promise<PaginatedResponse<IPlayer>> => {
    const query: Record<string, any> = {};

    if (filters?.role){
        query.role = filters.role;
    }
    if (filters?.minRating !== undefined){
        query.rating = {$gte: filters.minRating};
    }
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page -1) * limit;

    let sortOption: Record<string, 1 | -1> = {};
    if(filters.sort){
        const isDesc = filters.sort.startsWith('-');
        const fieldName = isDesc ? filters.sort.substring(1) : filters.sort;
        sortOption[fieldName] = isDesc ? -1 : 1;
    }

    const [data, total] = await Promise.all([
        Player.find(query).sort(sortOption).skip(skip).limit(limit),
        Player.countDocuments(query)
    ]);
    return {
        data,
        pagination: {
            page,
            limit,
            total,
            totalPage: Math.ceil(total / limit)
        }
    };
};

export const getTopPlayers = async (): Promise<PaginatedResponse<IPlayer>> => {
    const query = { rating: { $gte: 1.2 } };
    const data = await Player.find(query);
    const total = data.length;

    return {
        data,
        pagination: {
            page: 1,
            limit: total,
            total,
            totalPage: 1
        }
    };
};

export const getById = async (id: string) => {
    return Player.findById(id);
};

export const create = async (data: any) => {
    return Player.create(data);
};

export const update = async (id: string, data: Partial<CreateInput>) => {
    return Player.findByIdAndUpdate(
        id,
        data,
        {
            new: true,
            runValidators: true
        }
    );
};

export const remove = async (id: string): Promise<boolean> => {
    const deletePlayer = await Player.findByIdAndDelete(id);
    return deletePlayer !== null;
}