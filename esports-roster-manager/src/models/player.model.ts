import mongoose, {Schema, Document} from 'mongoose';

export interface IPlayer extends Document {
    nickname: string;
    description: string;
    rating: number;
    role: 'IGL' | 'AWPer' | 'Entry Fragger' | 'Support' | 'Rifler';
    ownerId: mongoose.Types.ObjectId;
    createdAt: Date;
    updateAt: string;
    displaySummary: string;
}

const playerSchema = new Schema<IPlayer>(
    {
        nickname: {
            type: String,
            required: [true, 'Нікнейм є обов\'язковим'],
            trim: true,
            minlength: [1, 'Нікнейм не може бути порожнім'],
            maxLength: [20, 'Нікнейм не можу бути більшим за 20 символів'],
            validate: {
                validator: function (value: string) {
                    return !value.includes(' ');
                },
                message: 'Нікнейм "{VALUE}" не повинен містити пробілів'
            }
        },
        description: {
            type: String,
            required: [true, 'Опис обов’язковий'],
            minlength: [1, 'Опис не може бути порожнім'],
            maxlength: [500, 'Опис занадто довгий']
        },
        role: {
            type: String,
            required: [true, 'Роль обов’язкова'],
            enum: {
                values: ['IGL', 'AWPer', 'Entry Fragger', 'Support', 'Rifler'],
                message: '{VALUE} такої ролі не існує'
            }
        },
        rating: {
            type: Number,
            required: true,
            min: [0, 'Рейтинг не може бути меншим за 0'],
            max: [3, 'Рейтинг не може бути більшим за 3'],
            default: 1.0
        },
        ownerId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true,
            transform: (doc, ret: any) => {
                ret.id = ret._id.toString();
                if (ret.ownerId) ret.ownerId = ret.ownerId.toString();
                return ret;
            }
        },
        toObject: { virtuals: true },
    });

playerSchema.virtual('displaySummary').get(function() {
    return `${this.nickname} [${this.role}] - Rating: ${this.rating}`;
});

const Player = mongoose.model<IPlayer>('Player', playerSchema);

export default Player;