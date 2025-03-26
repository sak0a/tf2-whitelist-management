export interface User {
    _id: string;
    steamId: string;
    personaName: string;
    profileUrl: string;
    avatar: string;
    avatarFull: string;
    discordUsername?: string;
    ipAddress?: string;
    submissionTime: Date;
    approvalTime?: Date;
    denialTime?: Date;
    status: 'pending' | 'approved' | 'denied' | 'removed';
    denialReason?: string;
    vacStatus: boolean;
    additionalInfo?: {
        gameBans: number;
        daysSinceLastBan: number;
        [key: string]: any;
    };
    createdAt: Date;
    updatedAt: Date;
}

export interface UserFormData {
    discordUsername: string;
    additionalInfo: {
        age?: number;
        experience?: string;
        referral?: string;
        [key: string]: any;
    };
}