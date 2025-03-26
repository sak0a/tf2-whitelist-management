import mongoose from 'mongoose';

export interface IUser {
    steamId: string;
    personaName: string;
    profileUrl: string;
    avatar: string;
    avatarFull: string;
    discordUsername?: string;
    ipAddress?: string;
    submissionTime?: Date;
    approvalTime?: Date;
    denialTime?: Date;
    status: 'pending' | 'approved' | 'denied' | 'removed';
    denialReason?: string;
    vacStatus?: boolean;
    additionalInfo?: Record<string, any>;
}

const userSchema = new mongoose.Schema<IUser>({
    steamId: { type: String, required: true, unique: true, index: true },
    personaName: { type: String, required: true },
    profileUrl: { type: String, required: true },
    avatar: { type: String, required: true },
    avatarFull: { type: String, required: true },
    discordUsername: String,
    ipAddress: String,
    submissionTime: { type: Date, default: Date.now },
    approvalTime: Date,
    denialTime: Date,
    status: {
        type: String,
        enum: ['pending', 'approved', 'denied', 'removed'],
        default: 'pending',
        index: true
    },
    denialReason: String,
    vacStatus: Boolean,
    additionalInfo: mongoose.Schema.Types.Mixed
}, {
    timestamps: true
});

// Create and export the model
export const User = mongoose.model<IUser>('User', userSchema);